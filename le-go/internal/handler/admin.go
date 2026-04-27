package handler

import (
        "strconv"

        "le-go/internal/model"
        "le-go/internal/pkg/pagination"
        "le-go/internal/pkg/response"

        "github.com/gin-gonic/gin"
        "golang.org/x/crypto/bcrypt"
)

// ==================== Admin User Management ====================

// ListAdminUser GET /admin/users - list admin users with pagination, keyword search, role filter
func ListAdminUser(c *gin.Context) {
        p := pagination.GetParams(c)
        query := model.DB.Model(&model.AdminUser{})

        // Keyword search (username, real_name, phone)
        if keyword := c.Query("keyword"); keyword != "" {
                like := "%" + keyword + "%"
                query = query.Where("username LIKE ? OR real_name LIKE ? OR phone LIKE ?", like, like, like)
        }

        // Role filter
        if roleStr := c.Query("role"); roleStr != "" {
                query = query.Where("role = ?", roleStr)
        }

        // Status filter
        if statusStr := c.Query("status"); statusStr != "" {
                query = query.Where("status = ?", statusStr)
        }

        var total int64
        query.Count(&total)

        var users []model.AdminUser
        if err := query.Order("id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&users).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.SuccessPage(c, users, total, p.Page, p.PageSize)
}

// GetAdminUser GET /admin/users/:id - get single admin user
func GetAdminUser(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "无效的ID")
                return
        }
        var user model.AdminUser
        if err := model.DB.First(&user, id).Error; err != nil {
                response.Error(c, response.CodeUserNotFound, "用户不存在")
                return
        }
        response.Success(c, user)
}

// CreateAdminUser POST /admin/users - create admin user (bcrypt hash password, assign role)
func CreateAdminUser(c *gin.Context) {
        var req struct {
                Username string `json:"username" binding:"required,min=2,max=50"`
                Password string `json:"password" binding:"required,min=6"`
                RealName string `json:"real_name"`
                Phone    string `json:"phone"`
                Email    string `json:"email"`
                Avatar   string `json:"avatar"`
                Role     int    `json:"role"`
                Status   int    `json:"status"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
                response.ErrorBadRequest(c, "信息填写有误")
                return
        }

        // Check username uniqueness
        var count int64
        model.DB.Model(&model.AdminUser{}).Where("username = ?", req.Username).Count(&count)
        if count > 0 {
                response.Error(c, response.CodePhoneExists, "用户名已存在")
                return
        }

        // Check phone uniqueness
        if req.Phone != "" {
                model.DB.Model(&model.AdminUser{}).Where("phone = ?", req.Phone).Count(&count)
                if count > 0 {
                        response.Error(c, response.CodePhoneExists, "手机号已存在")
                        return
                }
        }

        // Hash password
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
        if err != nil {
                response.ErrorServer(c)
                return
        }

        // Default role and status
        role := req.Role
        if role == 0 {
                role = model.RoleAdmin
        }
        status := req.Status
        if status == 0 {
                status = model.StatusNormal
        }

        user := model.AdminUser{
                Username: req.Username,
                Password: string(hashedPassword),
                RealName: req.RealName,
                Phone:    req.Phone,
                Email:    req.Email,
                Avatar:   req.Avatar,
                Role:     role,
                Status:   status,
        }

        if err := model.DB.Create(&user).Error; err != nil {
                response.ErrorServer(c)
                return
        }

        response.Success(c, gin.H{
                "id":       user.ID,
                "username": user.Username,
        })
}

// UpdateAdminUser PUT /admin/users/:id - update admin user
func UpdateAdminUser(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "无效的ID")
                return
        }
        var user model.AdminUser
        if err := model.DB.First(&user, id).Error; err != nil {
                response.Error(c, response.CodeUserNotFound, "用户不存在")
                return
        }

        var req struct {
                RealName string `json:"real_name"`
                Phone    string `json:"phone"`
                Email    string `json:"email"`
                Avatar   string `json:"avatar"`
                Role     *int   `json:"role"`
                Status   *int   `json:"status"`
                Password string `json:"password"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
                response.ErrorBadRequest(c, "参数错误: " + err.Error())
                return
        }

        updates := map[string]interface{}{}

        if req.RealName != "" {
                updates["real_name"] = req.RealName
        }
        if req.Phone != "" {
                // Check phone uniqueness
                var count int64
                model.DB.Model(&model.AdminUser{}).Where("phone = ? AND id != ?", req.Phone, id).Count(&count)
                if count > 0 {
                        response.Error(c, response.CodePhoneExists, "手机号已存在")
                        return
                }
                updates["phone"] = req.Phone
        }
        if req.Email != "" {
                updates["email"] = req.Email
        }
        if req.Avatar != "" {
                updates["avatar"] = req.Avatar
        }
        if req.Role != nil {
                updates["role"] = *req.Role
        }
        if req.Status != nil {
                updates["status"] = *req.Status
        }
        // Optionally reset password
        if req.Password != "" {
                hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
                if err != nil {
                        response.ErrorServer(c)
                        return
                }
                updates["password"] = string(hashedPassword)
        }

        if len(updates) == 0 {
                response.ErrorBadRequest(c, "没有需要更新的字段")
                return
        }

        if err := model.DB.Model(&user).Updates(updates).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        model.DB.First(&user, id)
        response.Success(c, user)
}

// DeleteAdminUser DELETE /admin/users/:id - delete admin user
func DeleteAdminUser(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "无效的ID")
                return
        }

        // Get current user ID from context
        currentUserID, exists := c.Get("user_id")
        if !exists {
                response.ErrorUnauthorized(c)
                return
        }

        // Prevent self-delete
        if uint(id) == currentUserID.(uint) {
                response.Error(c, response.CodeIllegal, "不能删除自己的账号")
                return
        }

        var user model.AdminUser
        if err := model.DB.First(&user, id).Error; err != nil {
                response.Error(c, response.CodeUserNotFound, "用户不存在")
                return
        }

        // Prevent deleting super admin
        if user.Role >= model.RoleSuperAdmin {
                response.Error(c, response.CodeIllegal, "不能删除超级管理员")
                return
        }

        // Delete user-role associations first
        model.DB.Where("user_id = ?", id).Delete(&model.UserRole{})

        if err := model.DB.Delete(&user).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, nil)
}

// ==================== Role Management ====================

// ListRole GET /admin/roles - list all roles
func ListRole(c *gin.Context) {
        var roles []model.Role
        if err := model.DB.Order("sort ASC, id ASC").Find(&roles).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, roles)
}

// GetRole GET /admin/roles/:id - get role with menu IDs
func GetRole(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "无效的ID")
                return
        }
        var role model.Role
        if err := model.DB.First(&role, id).Error; err != nil {
                response.Error(c, response.CodeUserNotFound, "角色不存在")
                return
        }

        // Get assigned menu IDs
        var menuIDs []uint
        model.DB.Model(&model.RoleMenu{}).Where("role_id = ?", id).Pluck("menu_id", &menuIDs)

        response.Success(c, gin.H{
                "role":     role,
                "menu_ids": menuIDs,
        })
}

// CreateRole POST /admin/roles - create role
func CreateRole(c *gin.Context) {
        var req struct {
                RoleName string `json:"role_name" binding:"required"`
                RoleKey  string `json:"role_key" binding:"required"`
                Sort     int    `json:"sort"`
                Status   int    `json:"status"`
                Desc     string `json:"desc"`
                MenuIDs  []uint `json:"menu_ids"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
                response.ErrorBadRequest(c, "参数错误: " + err.Error())
                return
        }

        role := model.Role{
                RoleName: req.RoleName,
                RoleKey:  req.RoleKey,
                Sort:     req.Sort,
                Status:   req.Status,
                Desc:     req.Desc,
        }
        if role.Sort == 0 {
                role.Sort = 100
        }
        if role.Status == 0 {
                role.Status = model.StatusNormal
        }

        tx := model.DB.Begin()
        if err := tx.Create(&role).Error; err != nil {
                tx.Rollback()
                response.ErrorServer(c)
                return
        }

        // Assign menus if provided
        if len(req.MenuIDs) > 0 {
                roleMenus := make([]model.RoleMenu, len(req.MenuIDs))
                for i, menuID := range req.MenuIDs {
                        roleMenus[i] = model.RoleMenu{RoleID: role.ID, MenuID: menuID}
                }
                if err := tx.Create(&roleMenus).Error; err != nil {
                        tx.Rollback()
                        response.ErrorServer(c)
                        return
                }
        }

        tx.Commit()
        response.Success(c, role)
}

// UpdateRole PUT /admin/roles/:id - update role
func UpdateRole(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "无效的ID")
                return
        }
        var role model.Role
        if err := model.DB.First(&role, id).Error; err != nil {
                response.Error(c, response.CodeUserNotFound, "角色不存在")
                return
        }

        var req struct {
                RoleName string `json:"role_name"`
                RoleKey  string `json:"role_key"`
                Sort     int    `json:"sort"`
                Status   int    `json:"status"`
                Desc     string `json:"desc"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
                response.ErrorBadRequest(c, "参数错误: " + err.Error())
                return
        }

        updates := map[string]interface{}{}
        if req.RoleName != "" {
                updates["role_name"] = req.RoleName
        }
        if req.RoleKey != "" {
                updates["role_key"] = req.RoleKey
        }
        if req.Sort > 0 {
                updates["sort"] = req.Sort
        }
        updates["status"] = req.Status
        if req.Desc != "" {
                updates["desc"] = req.Desc
        }

        if err := model.DB.Model(&role).Updates(updates).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        model.DB.First(&role, id)
        response.Success(c, role)
}

// DeleteRole DELETE /admin/roles/:id - delete role
func DeleteRole(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "无效的ID")
                return
        }
        var role model.Role
        if err := model.DB.First(&role, id).Error; err != nil {
                response.Error(c, response.CodeUserNotFound, "角色不存在")
                return
        }

        // Check if role is assigned to any users
        var userCount int64
        model.DB.Model(&model.UserRole{}).Where("role_id = ?", id).Count(&userCount)
        if userCount > 0 {
                response.Error(c, response.CodeIllegal, "该角色已分配给用户，无法删除")
                return
        }

        tx := model.DB.Begin()
        // Delete role-menu associations
        tx.Where("role_id = ?", id).Delete(&model.RoleMenu{})
        // Delete role
        if err := tx.Delete(&role).Error; err != nil {
                tx.Rollback()
                response.ErrorServer(c)
                return
        }
        tx.Commit()
        response.Success(c, nil)
}

// UpdateRoleMenus PUT /admin/roles/:id/menus - assign menus to role
func UpdateRoleMenus(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "无效的ID")
                return
        }
        var role model.Role
        if err := model.DB.First(&role, id).Error; err != nil {
                response.Error(c, response.CodeUserNotFound, "角色不存在")
                return
        }

        var req struct {
                MenuIDs []uint `json:"menu_ids" binding:"required"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
                response.ErrorBadRequest(c, "参数错误: " + err.Error())
                return
        }

        tx := model.DB.Begin()
        // Delete existing role-menu associations
        if err := tx.Where("role_id = ?", id).Delete(&model.RoleMenu{}).Error; err != nil {
                tx.Rollback()
                response.ErrorServer(c)
                return
        }

        // Create new associations
        if len(req.MenuIDs) > 0 {
                roleMenus := make([]model.RoleMenu, len(req.MenuIDs))
                for i, menuID := range req.MenuIDs {
                        roleMenus[i] = model.RoleMenu{RoleID: role.ID, MenuID: menuID}
                }
                if err := tx.Create(&roleMenus).Error; err != nil {
                        tx.Rollback()
                        response.ErrorServer(c)
                        return
                }
        }

        tx.Commit()
        response.Success(c, nil)
}

// ==================== Menu Management ====================

// ListMenu GET /admin/menus - list menus as tree structure
func ListMenu(c *gin.Context) {
        var menus []model.Menu
        if err := model.DB.Order("sort ASC, id ASC").Find(&menus).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        tree := buildMenuTree(menus, 0)
        response.Success(c, tree)
}

// buildMenuTree builds a tree structure from flat menu list
func buildMenuTree(menus []model.Menu, parentID uint) []gin.H {
        var tree []gin.H
        for _, m := range menus {
                if m.ParentID == parentID {
                        node := gin.H{
                                "id":       m.ID,
                                "parent_id": m.ParentID,
                                "name":     m.Name,
                                "path":     m.Path,
                                "icon":     m.Icon,
                                "sort":     m.Sort,
                                "type":     m.Type,
                                "perm":     m.Perm,
                                "hidden":   m.Hidden,
                                "status":   m.Status,
                                "children": buildMenuTree(menus, m.ID),
                        }
                        tree = append(tree, node)
                }
        }
        return tree
}

// GetMenu GET /admin/menus/:id - get single menu
func GetMenu(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "无效的ID")
                return
        }
        var menu model.Menu
        if err := model.DB.First(&menu, id).Error; err != nil {
                response.Error(c, response.CodeUserNotFound, "菜单不存在")
                return
        }
        response.Success(c, menu)
}

// CreateMenu POST /admin/menus - create menu
func CreateMenu(c *gin.Context) {
        var req struct {
                ParentID uint   `json:"parent_id"`
                Name     string `json:"name" binding:"required"`
                Path     string `json:"path"`
                Icon     string `json:"icon"`
                Sort     int    `json:"sort"`
                Type     int    `json:"type"`
                Perm     string `json:"perm"`
                Hidden   int    `json:"hidden"`
                Status   int    `json:"status"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
                response.ErrorBadRequest(c, "参数错误: " + err.Error())
                return
        }

        menu := model.Menu{
                ParentID: req.ParentID,
                Name:     req.Name,
                Path:     req.Path,
                Icon:     req.Icon,
                Sort:     req.Sort,
                Type:     req.Type,
                Perm:     req.Perm,
                Hidden:   req.Hidden,
                Status:   req.Status,
        }
        if menu.Sort == 0 {
                menu.Sort = 100
        }
        if menu.Type == 0 {
                menu.Type = 1
        }
        if menu.Status == 0 {
                menu.Status = model.StatusNormal
        }

        if err := model.DB.Create(&menu).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, menu)
}

// UpdateMenu PUT /admin/menus/:id - update menu
func UpdateMenu(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "无效的ID")
                return
        }
        var menu model.Menu
        if err := model.DB.First(&menu, id).Error; err != nil {
                response.Error(c, response.CodeUserNotFound, "菜单不存在")
                return
        }

        var req struct {
                ParentID uint   `json:"parent_id"`
                Name     string `json:"name"`
                Path     string `json:"path"`
                Icon     string `json:"icon"`
                Sort     int    `json:"sort"`
                Type     int    `json:"type"`
                Perm     string `json:"perm"`
                Hidden   int    `json:"hidden"`
                Status   int    `json:"status"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
                response.ErrorBadRequest(c, "参数错误: " + err.Error())
                return
        }

        updates := map[string]interface{}{}
        updates["parent_id"] = req.ParentID
        if req.Name != "" {
                updates["name"] = req.Name
        }
        if req.Path != "" {
                updates["path"] = req.Path
        }
        if req.Icon != "" {
                updates["icon"] = req.Icon
        }
        if req.Sort > 0 {
                updates["sort"] = req.Sort
        }
        if req.Type > 0 {
                updates["type"] = req.Type
        }
        if req.Perm != "" {
                updates["perm"] = req.Perm
        }
        updates["hidden"] = req.Hidden
        updates["status"] = req.Status

        // Prevent setting parent_id to self (circular reference)
        if req.ParentID > 0 && req.ParentID == uint(id) {
                response.Error(c, response.CodeIllegal, "不能将菜单设置为自身的子菜单")
                return
        }

        if err := model.DB.Model(&menu).Updates(updates).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        model.DB.First(&menu, id)
        response.Success(c, menu)
}

// DeleteMenu DELETE /admin/menus/:id - delete menu (check for children)
func DeleteMenu(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "无效的ID")
                return
        }
        var menu model.Menu
        if err := model.DB.First(&menu, id).Error; err != nil {
                response.Error(c, response.CodeUserNotFound, "菜单不存在")
                return
        }

        // Check for children
        var childCount int64
        model.DB.Model(&model.Menu{}).Where("parent_id = ?", id).Count(&childCount)
        if childCount > 0 {
                response.Error(c, response.CodeIllegal, "该菜单下存在子菜单，无法删除")
                return
        }

        tx := model.DB.Begin()
        // Delete role-menu associations for this menu
        tx.Where("menu_id = ?", id).Delete(&model.RoleMenu{})
        // Delete menu
        if err := tx.Delete(&menu).Error; err != nil {
                tx.Rollback()
                response.ErrorServer(c)
                return
        }
        tx.Commit()
        response.Success(c, nil)
}

// ==================== Operation Logs ====================

// ListOperationLog GET /admin/logs - list operation logs with pagination
func ListOperationLog(c *gin.Context) {
        p := pagination.GetParams(c)
        query := model.DB.Model(&model.OperationLog{})

        // User ID filter
        if userIDStr := c.Query("user_id"); userIDStr != "" {
                query = query.Where("user_id = ?", userIDStr)
        }

        // Username filter
        if username := c.Query("username"); username != "" {
                query = query.Where("username LIKE ?", "%"+username+"%")
        }

        // Date range filter
        if startDate := c.Query("start_date"); startDate != "" {
                query = query.Where("created_at >= ?", startDate)
        }
        if endDate := c.Query("end_date"); endDate != "" {
                query = query.Where("created_at <= ?", endDate+" 23:59:59")
        }

        // Method filter
        if method := c.Query("method"); method != "" {
                query = query.Where("method = ?", method)
        }

        // Path filter
        if path := c.Query("path"); path != "" {
                query = query.Where("path LIKE ?", "%"+path+"%")
        }

        var total int64
        query.Count(&total)

        var logs []model.OperationLog
        if err := query.Order("id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&logs).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.SuccessPage(c, logs, total, p.Page, p.PageSize)
}

// ==================== User Menus (based on role) ====================

// GetUserMenus GET /auth/menus - returns menu tree based on user's role
func GetUserMenus(c *gin.Context) {
        userID, exists := c.Get("user_id")
        if !exists {
                response.ErrorUnauthorized(c)
                return
        }

        // Check if user is super admin, return all menus
        var user model.AdminUser
        if err := model.DB.First(&user, userID).Error; err != nil {
                response.Error(c, response.CodeUserNotFound, "用户不存在")
                return
        }

        var menus []model.Menu
        if user.Role >= model.RoleSuperAdmin {
                // Super admin sees all menus
                model.DB.Where("status = ?", model.StatusNormal).Order("sort ASC, id ASC").Find(&menus)
        } else {
                // Get role IDs for this user
                var roleIDs []uint
                model.DB.Model(&model.UserRole{}).Where("user_id = ?", userID).Pluck("role_id", &roleIDs)
                if len(roleIDs) == 0 {
                        // No role assigned, return empty
                        response.Success(c, []gin.H{})
                        return
                }
                // Get menu IDs for these roles
                var menuIDs []uint
                model.DB.Model(&model.RoleMenu{}).Where("role_id IN ?", roleIDs).Distinct("menu_id").Pluck("menu_id", &menuIDs)
                if len(menuIDs) == 0 {
                        response.Success(c, []gin.H{})
                        return
                }
                model.DB.Where("id IN ? AND status = ?", menuIDs, model.StatusNormal).Order("sort ASC, id ASC").Find(&menus)
        }

        tree := buildMenuTree(menus, 0)
        response.Success(c, tree)
}

// ==================== Helper: Record Operation Log ====================

// RecordOperationLog records an operation log entry (can be called from other handlers)
func RecordOperationLog(userID uint, username, method, path, ip, body string, result int, remark string) {
        log := model.OperationLog{
                UserID:   userID,
                Username: username,
                Method:   method,
                Path:     path,
                IP:       ip,
                Body:     body,
                Result:   result,
                Remark:   remark,
        }
        // Ignore errors for logging - don't disrupt main flow
        _ = model.DB.Create(&log).Error
}


