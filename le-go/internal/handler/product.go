package handler

import (
        "strconv"

        "le-go/internal/model"
        "le-go/internal/pkg/pagination"
        "le-go/internal/pkg/response"

        "github.com/gin-gonic/gin"
        "gorm.io/gorm"
)

// ProductHandler handles product-related requests
type ProductHandler struct {
        DB *gorm.DB
}

// NewProductHandler creates a new ProductHandler
func NewProductHandler(db *gorm.DB) *ProductHandler {
        return &ProductHandler{DB: db}
}

// =====================================================================
// Category handlers
// =====================================================================

// ListCategory GET /product/category - list all categories
func (h *ProductHandler) ListCategory(c *gin.Context) {
        var categories []model.ProductCategory
        if err := h.DB.Order("sort ASC, id DESC").Find(&categories).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, categories)
}

// GetCategory GET /product/category/:id - get single category
func (h *ProductHandler) GetCategory(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var category model.ProductCategory
        if err := h.DB.First(&category, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "分类不存在")
                return
        }
        response.Success(c, category)
}

// CreateCategory POST /product/category - create a category
func (h *ProductHandler) CreateCategory(c *gin.Context) {
        var category model.ProductCategory
        if err := c.ShouldBindJSON(&category); err != nil {
                response.ErrorBadRequest(c, "参数错误: "+err.Error())
                return
        }
        if category.Name == "" {
                response.Error(c, response.CodeInvalidInput, "分类名称不能为空")
                return
        }
        if err := h.DB.Create(&category).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, category)
}

// UpdateCategory PUT /product/category/:id - update a category
func (h *ProductHandler) UpdateCategory(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var category model.ProductCategory
        if err := h.DB.First(&category, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "分类不存在")
                return
        }
        var req model.ProductCategory
        if err := c.ShouldBindJSON(&req); err != nil {
                response.ErrorBadRequest(c, "参数错误: "+err.Error())
                return
        }
        updates := map[string]interface{}{}
        if req.Name != "" {
                updates["name"] = req.Name
        }
        if req.Image != "" {
                updates["image"] = req.Image
        }
        updates["sort"] = req.Sort
        if err := h.DB.Model(&category).Updates(updates).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        h.DB.First(&category, id)
        response.Success(c, category)
}

// DeleteCategory DELETE /product/category/:id - delete a category
func (h *ProductHandler) DeleteCategory(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var category model.ProductCategory
        if err := h.DB.First(&category, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "分类不存在")
                return
        }
        // Check if any brands reference this category
        var brandCount int64
        h.DB.Model(&model.ProductBrands{}).Where("type_id = ?", id).Count(&brandCount)
        if brandCount > 0 {
                response.Error(c, response.CodeIllegal, "该分类下存在品牌，无法删除")
                return
        }
        if err := h.DB.Delete(&category).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, nil)
}

// =====================================================================
// Brand handlers
// =====================================================================

// ListBrand GET /product/brand - list brands with optional category_id filter
func (h *ProductHandler) ListBrand(c *gin.Context) {
        query := h.DB.Model(&model.ProductBrands{})

        // Filter by category_id
        if categoryID := c.Query("category_id"); categoryID != "" {
                query = query.Where("type_id = ?", categoryID)
        }

        var brands []model.ProductBrands
        if err := query.Order("sort ASC, id DESC").Find(&brands).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, brands)
}

// CreateBrand POST /product/brand - create a brand
func (h *ProductHandler) CreateBrand(c *gin.Context) {
        var brand model.ProductBrands
        if err := c.ShouldBindJSON(&brand); err != nil {
                response.ErrorBadRequest(c, "参数错误: "+err.Error())
                return
        }
        if brand.Name == "" {
                response.Error(c, response.CodeInvalidInput, "品牌名称不能为空")
                return
        }
        if brand.TypeID == 0 {
                response.Error(c, response.CodeInvalidInput, "请选择分类")
                return
        }
        if err := h.DB.Create(&brand).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, brand)
}

// UpdateBrand PUT /product/brand/:id - update a brand
func (h *ProductHandler) UpdateBrand(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var brand model.ProductBrands
        if err := h.DB.First(&brand, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "品牌不存在")
                return
        }
        var req model.ProductBrands
        if err := c.ShouldBindJSON(&req); err != nil {
                response.ErrorBadRequest(c, "参数错误: "+err.Error())
                return
        }
        updates := map[string]interface{}{}
        if req.TypeID > 0 {
                updates["type_id"] = req.TypeID
        }
        if req.Name != "" {
                updates["name"] = req.Name
        }
        if req.Image != "" {
                updates["image"] = req.Image
        }
        updates["sort"] = req.Sort
        updates["ishot"] = req.Ishot
        updates["onsale"] = req.Onsale
        if err := h.DB.Model(&brand).Updates(updates).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        h.DB.First(&brand, id)
        response.Success(c, brand)
}

// DeleteBrand DELETE /product/brand/:id - delete a brand
func (h *ProductHandler) DeleteBrand(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var brand model.ProductBrands
        if err := h.DB.First(&brand, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "品牌不存在")
                return
        }
        // Check if any products reference this brand
        var productCount int64
        h.DB.Model(&model.ProductList{}).Where("brand_id = ?", id).Count(&productCount)
        if productCount > 0 {
                response.Error(c, response.CodeIllegal, "该品牌下存在产品，无法删除")
                return
        }
        if err := h.DB.Delete(&brand).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, nil)
}

// =====================================================================
// Product handlers
// =====================================================================

// ListProduct GET /product/list - list products with pagination, brand_id filter, keyword search
func (h *ProductHandler) ListProduct(c *gin.Context) {
        p := pagination.GetParams(c)
        query := h.DB.Model(&model.ProductList{})

        // Filter by brand_id
        if brandID := c.Query("brand_id"); brandID != "" {
                query = query.Where("brand_id = ?", brandID)
        }

        // Filter by category through brands
        if categoryID := c.Query("category_id"); categoryID != "" {
                var brandIDs []uint
                h.DB.Model(&model.ProductBrands{}).Where("type_id = ?", categoryID).Pluck("id", &brandIDs)
                if len(brandIDs) > 0 {
                        query = query.Where("brand_id IN ?", brandIDs)
                }
        }

        // Keyword search
        if keyword := c.Query("keyword"); keyword != "" {
                like := "%" + keyword + "%"
                query = query.Where("product_name LIKE ? OR search_text LIKE ?", like, like)
        }

        // Filter by display
        if display := c.Query("display"); display != "" {
                query = query.Where("display = ?", display)
        }

        var total int64
        query.Count(&total)

        var products []model.ProductList
        if err := query.Order("sort ASC, id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&products).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.SuccessPage(c, products, total, p.Page, p.PageSize)
}

// GetProduct GET /product/:id - get single product with descriptions
func (h *ProductHandler) GetProduct(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var product model.ProductList
        if err := h.DB.First(&product, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "产品不存在")
                return
        }

        // Build response with description pack
        result := gin.H{
                "product": product,
        }

        if product.DescID != nil && *product.DescID > 0 {
                var descList model.DescList
                if err := h.DB.First(&descList, *product.DescID).Error; err == nil {
                        var titles []model.DescTitle
                        h.DB.Where("desc_id = ?", *product.DescID).Order("sort ASC, id ASC").Find(&titles)

                        // Preload options and images for each title
                        for i := range titles {
                                var options []model.DescOption
                                h.DB.Where("title_id = ?", titles[i].ID).Order("sort ASC, id ASC").Find(&options)

                                // Preload images for options that have image_id
                                for j := range options {
                                        if options[j].ImageID != nil && *options[j].ImageID > 0 {
                                                var img model.DescImage
                                                if h.DB.First(&img, *options[j].ImageID).Error == nil {
                                                        options[j].Info = img.Image // populate image URL into info field
                                                }
                                        }
                                }
                                titles[i] = titles[i] // dereference for JSON
                                result["options_"+strconv.Itoa(int(titles[i].ID))] = options
                        }
                        result["desc"] = descList
                        result["titles"] = titles
                }
        }

        response.Success(c, result)
}

// CreateProduct POST /product - create a product
func (h *ProductHandler) CreateProduct(c *gin.Context) {
        var product model.ProductList
        if err := c.ShouldBindJSON(&product); err != nil {
                response.ErrorBadRequest(c, "参数错误: "+err.Error())
                return
        }
        if product.ProductName == "" {
                response.Error(c, response.CodeInvalidInput, "产品名称不能为空")
                return
        }
        if err := h.DB.Create(&product).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, product)
}

// UpdateProduct PUT /product/:id - update a product
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var product model.ProductList
        if err := h.DB.First(&product, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "产品不存在")
                return
        }
        var req model.ProductList
        if err := c.ShouldBindJSON(&req); err != nil {
                response.ErrorBadRequest(c, "参数错误: "+err.Error())
                return
        }
        updates := map[string]interface{}{}
        if req.ProductName != "" {
                updates["product_name"] = req.ProductName
        }
        if req.Model != "" {
                updates["model"] = req.Model
        }
        if req.DescID != nil {
                updates["desc_id"] = req.DescID
        }
        if req.BrandID != nil {
                updates["brand_id"] = req.BrandID
        }
        updates["product_price"] = req.ProductPrice
        updates["lowest_price"] = req.LowestPrice
        updates["new_price"] = req.NewPrice
        if req.ProductImg != "" {
                updates["product_img"] = req.ProductImg
        }
        updates["price7"] = req.Price7
        updates["ishot"] = req.Ishot
        updates["display"] = req.Display
        updates["sort"] = req.Sort
        if req.SearchText != "" {
                updates["search_text"] = req.SearchText
        }
        if err := h.DB.Model(&product).Updates(updates).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        h.DB.First(&product, id)
        response.Success(c, product)
}

// DeleteProduct DELETE /product/:id - delete a product
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var product model.ProductList
        if err := h.DB.First(&product, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "产品不存在")
                return
        }
        if err := h.DB.Delete(&product).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, nil)
}

// =====================================================================
// Order handlers
// =====================================================================

// ListOrder GET /product/order - list orders with pagination, status filter, keyword search, date range
func (h *ProductHandler) ListOrder(c *gin.Context) {
        p := pagination.GetParams(c)
        query := h.DB.Model(&model.ProductOrder{})

        // Filter by status
        if status := c.Query("status"); status != "" {
                query = query.Where("status = ?", status)
        }

        // Keyword search (order_id, referee, exp_order)
        if keyword := c.Query("keyword"); keyword != "" {
                like := "%" + keyword + "%"
                query = query.Where("order_id LIKE ? OR referee LIKE ? OR exp_order LIKE ? OR user_del = 0", like, like, like)
        }

        // Date range filter
        if startDate := c.Query("start_date"); startDate != "" {
                query = query.Where("created_at >= ?", startDate)
        }
        if endDate := c.Query("end_date"); endDate != "" {
                query = query.Where("created_at <= ?", endDate+" 23:59:59")
        }

        // Filter by method
        if method := c.Query("method"); method != "" {
                query = query.Where("method = ?", method)
        }

        // Filter by source
        if source := c.Query("source"); source != "" {
                query = query.Where("source = ?", source)
        }

        // Exclude user-deleted orders by default
        query = query.Where("user_del = 0")

        var total int64
        query.Count(&total)

        var orders []model.ProductOrder
        if err := query.Order("id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&orders).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.SuccessPage(c, orders, total, p.Page, p.PageSize)
}

// GetOrder GET /product/order/:id - get single order
func (h *ProductHandler) GetOrder(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var order model.ProductOrder
        if err := h.DB.First(&order, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "订单不存在")
                return
        }
        response.Success(c, order)
}

// UpdateOrder PUT /product/order/:id - update order
func (h *ProductHandler) UpdateOrder(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var order model.ProductOrder
        if err := h.DB.First(&order, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "订单不存在")
                return
        }
        var req model.ProductOrder
        if err := c.ShouldBindJSON(&req); err != nil {
                response.ErrorBadRequest(c, "参数错误: "+err.Error())
                return
        }
        updates := map[string]interface{}{}
        if req.Status > 0 {
                updates["status"] = req.Status
        }
        updates["assess_price"] = req.AssessPrice
        updates["actual_price"] = req.ActualPrice
        updates["apply_price"] = req.ApplyPrice
        if req.ActualDesc != "" {
                updates["actual_desc"] = req.ActualDesc
        }
        if req.Method >= 0 {
                updates["method"] = req.Method
        }
        if req.Referee != "" {
                updates["referee"] = req.Referee
        }
        updates["exp_fee"] = req.ExpFee
        updates["exp_pay"] = req.ExpPay
        if req.ExpOrder != "" {
                updates["exp_order"] = req.ExpOrder
        }
        if req.DescText != "" {
                updates["desc_text"] = req.DescText
        }
        if req.Info != "" {
                updates["info"] = req.Info
        }
        if req.Tester != "" {
                updates["tester"] = req.Tester
        }
        if req.Coupon != "" {
                updates["coupon"] = req.Coupon
        }
        updates["is_problem"] = req.IsProblem
        updates["exp_on"] = req.ExpOn
        updates["send_sms"] = req.SendSms
        if err := h.DB.Model(&order).Updates(updates).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        h.DB.First(&order, id)
        response.Success(c, order)
}

// =====================================================================
// Description pack handlers
// =====================================================================

// ListDesc GET /product/desc - list description packs
func (h *ProductHandler) ListDesc(c *gin.Context) {
        var descList []model.DescList
        if err := h.DB.Order("id DESC").Find(&descList).Error; err != nil {
                response.ErrorServer(c)
                return
        }

        // For each desc pack, load its titles and options
        type DescPack struct {
                model.DescList
                Titles []struct {
                        model.DescTitle
                        Options []model.DescOption `json:"options"`
                } `json:"titles"`
        }

        var result []DescPack
        for _, d := range descList {
                pack := DescPack{DescList: d}

                var titles []model.DescTitle
                h.DB.Where("desc_id = ?", d.ID).Order("sort ASC, id ASC").Find(&titles)

                for _, t := range titles {
                        titleItem := struct {
                                model.DescTitle
                                Options []model.DescOption `json:"options"`
                        }{DescTitle: t}

                        var options []model.DescOption
                        h.DB.Where("title_id = ?", t.ID).Order("sort ASC, id ASC").Find(&options)
                        titleItem.Options = options
                        pack.Titles = append(pack.Titles, titleItem)
                }

                result = append(result, pack)
        }

        response.Success(c, result)
}

// CreateDesc POST /product/desc - create a description pack
func (h *ProductHandler) CreateDesc(c *gin.Context) {
        var input struct {
                Name   string `json:"name"`
                Titles []struct {
                        Type    int `json:"type"`
                        Title   string `json:"title"`
                        Sort    int `json:"sort"`
                        Options []struct {
                                Text    string   `json:"text"`
                                Info    string   `json:"info"`
                                ImageID *uint    `json:"image_id"`
                                Sort    int      `json:"sort"`
                                Ratio   float64  `json:"ratio"`
                        } `json:"options"`
                } `json:"titles"`
        }
        if err := c.ShouldBindJSON(&input); err != nil {
                response.ErrorBadRequest(c, "参数错误: "+err.Error())
                return
        }
        if input.Name == "" {
                response.Error(c, response.CodeInvalidInput, "描述包名称不能为空")
                return
        }

        tx := h.DB.Begin()

        // Create desc list
        descList := model.DescList{Name: input.Name}
        if err := tx.Create(&descList).Error; err != nil {
                tx.Rollback()
                response.ErrorServer(c)
                return
        }

        // Create titles and options
        for _, t := range input.Titles {
                title := model.DescTitle{
                        DescID: descList.ID,
                        Type:   t.Type,
                        Title:  t.Title,
                        Sort:   t.Sort,
                }
                if title.Type == 0 {
                        title.Type = model.DescTitleTypeSingle
                }
                if err := tx.Create(&title).Error; err != nil {
                        tx.Rollback()
                        response.ErrorServer(c)
                        return
                }
                for _, opt := range t.Options {
                        option := model.DescOption{
                                TitleID: title.ID,
                                Text:    opt.Text,
                                Info:    opt.Info,
                                ImageID: opt.ImageID,
                                Sort:    opt.Sort,
                                Ratio:   opt.Ratio,
                        }
                        if err := tx.Create(&option).Error; err != nil {
                                tx.Rollback()
                                response.ErrorServer(c)
                                return
                        }
                }
        }

        tx.Commit()
        response.Success(c, descList)
}

// UpdateDesc PUT /product/desc/:id - update a description pack
func (h *ProductHandler) UpdateDesc(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var descList model.DescList
        if err := h.DB.First(&descList, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "描述包不存在")
                return
        }

        var input struct {
                Name   string `json:"name"`
                Titles []struct {
                        ID      *uint `json:"id"`
                        Type    int   `json:"type"`
                        Title   string `json:"title"`
                        Sort    int   `json:"sort"`
                        Options []struct {
                                ID      *uint    `json:"id"`
                                Text    string   `json:"text"`
                                Info    string   `json:"info"`
                                ImageID *uint    `json:"image_id"`
                                Sort    int      `json:"sort"`
                                Ratio   float64  `json:"ratio"`
                        } `json:"options"`
                } `json:"titles"`
        }
        if err := c.ShouldBindJSON(&input); err != nil {
                response.ErrorBadRequest(c, "参数错误: "+err.Error())
                return
        }

        tx := h.DB.Begin()

        // Update desc name
        if input.Name != "" {
                if err := tx.Model(&descList).Update("name", input.Name).Error; err != nil {
                        tx.Rollback()
                        response.ErrorServer(c)
                        return
                }
        }

        // Track existing title IDs to find deleted ones
        var existingTitleIDs []uint
        tx.Model(&model.DescTitle{}).Where("desc_id = ?", id).Pluck("id", &existingTitleIDs)
        keptTitleIDs := map[uint]bool{}
        newTitleIDs := []uint{}

        for _, t := range input.Titles {
                var titleID uint
                if t.ID != nil && *t.ID > 0 {
                        // Update existing title
                        titleID = *t.ID
                        updates := map[string]interface{}{
                                "type":  t.Type,
                                "title": t.Title,
                                "sort":  t.Sort,
                        }
                        if err := tx.Model(&model.DescTitle{}).Where("id = ? AND desc_id = ?", titleID, id).Updates(updates).Error; err != nil {
                                tx.Rollback()
                                response.ErrorServer(c)
                                return
                        }
                        keptTitleIDs[titleID] = true
                } else {
                        // Create new title
                        title := model.DescTitle{
                                DescID: uint(id),
                                Type:   t.Type,
                                Title:  t.Title,
                                Sort:   t.Sort,
                        }
                        if title.Type == 0 {
                                title.Type = model.DescTitleTypeSingle
                        }
                        if err := tx.Create(&title).Error; err != nil {
                                tx.Rollback()
                                response.ErrorServer(c)
                                return
                        }
                        titleID = title.ID
                        newTitleIDs = append(newTitleIDs, titleID)
                }

                // Handle options for this title
                var existingOptionIDs []uint
                tx.Model(&model.DescOption{}).Where("title_id = ?", titleID).Pluck("id", &existingOptionIDs)
                keptOptionIDs := map[uint]bool{}

                for _, opt := range t.Options {
                        if opt.ID != nil && *opt.ID > 0 {
                                updates := map[string]interface{}{
                                        "text":    opt.Text,
                                        "info":    opt.Info,
                                        "image_id": opt.ImageID,
                                        "sort":    opt.Sort,
                                        "ratio":   opt.Ratio,
                                }
                                if err := tx.Model(&model.DescOption{}).Where("id = ? AND title_id = ?", *opt.ID, titleID).Updates(updates).Error; err != nil {
                                        tx.Rollback()
                                        response.ErrorServer(c)
                                        return
                                }
                                keptOptionIDs[*opt.ID] = true
                        } else {
                                option := model.DescOption{
                                        TitleID: titleID,
                                        Text:    opt.Text,
                                        Info:    opt.Info,
                                        ImageID: opt.ImageID,
                                        Sort:    opt.Sort,
                                        Ratio:   opt.Ratio,
                                }
                                if err := tx.Create(&option).Error; err != nil {
                                        tx.Rollback()
                                        response.ErrorServer(c)
                                        return
                                }
                        }
                }

                // Delete removed options
                for _, optID := range existingOptionIDs {
                        if !keptOptionIDs[optID] {
                                tx.Delete(&model.DescOption{}, optID)
                        }
                }
        }

        // Delete removed titles
        for _, titleID := range existingTitleIDs {
                if !keptTitleIDs[titleID] {
                        tx.Where("title_id = ?", titleID).Delete(&model.DescOption{})
                        tx.Delete(&model.DescTitle{}, titleID)
                }
        }

        tx.Commit()
        h.DB.First(&descList, id)
        response.Success(c, descList)
}

// DeleteDesc DELETE /product/desc/:id - delete a description pack
func (h *ProductHandler) DeleteDesc(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var descList model.DescList
        if err := h.DB.First(&descList, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "描述包不存在")
                return
        }
        // Check if any products reference this desc pack
        if descList.HasDescriptions(h.DB) {
                response.Error(c, response.CodeIllegal, "该描述包已被产品使用，无法删除")
                return
        }

        tx := h.DB.Begin()
        // Delete options through titles
        var titleIDs []uint
        tx.Model(&model.DescTitle{}).Where("desc_id = ?", id).Pluck("id", &titleIDs)
        if len(titleIDs) > 0 {
                tx.Where("title_id IN ?", titleIDs).Delete(&model.DescOption{})
                tx.Where("desc_id = ?", id).Delete(&model.DescTitle{})
        }
        tx.Delete(&descList)
        tx.Commit()

        response.Success(c, nil)
}

// =====================================================================
// Coupon handlers
// =====================================================================

// ListCoupon GET /product/coupon - list coupons
func (h *ProductHandler) ListCoupon(c *gin.Context) {
        var coupons []model.Coupon
        query := h.DB.Model(&model.Coupon{})

        // Filter by status
        if status := c.Query("status"); status != "" {
                query = query.Where("status = ?", status)
        }

        if err := query.Order("sort ASC, id DESC").Find(&coupons).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, coupons)
}

// CreateCoupon POST /product/coupon - create a coupon
func (h *ProductHandler) CreateCoupon(c *gin.Context) {
        var coupon model.Coupon
        if err := c.ShouldBindJSON(&coupon); err != nil {
                response.ErrorBadRequest(c, "参数错误: "+err.Error())
                return
        }
        if coupon.Title == "" {
                response.Error(c, response.CodeInvalidInput, "优惠券标题不能为空")
                return
        }
        if err := h.DB.Create(&coupon).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, coupon)
}

// UpdateCoupon PUT /product/coupon/:id - update a coupon
func (h *ProductHandler) UpdateCoupon(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var coupon model.Coupon
        if err := h.DB.First(&coupon, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "优惠券不存在")
                return
        }
        var req model.Coupon
        if err := c.ShouldBindJSON(&req); err != nil {
                response.ErrorBadRequest(c, "参数错误: "+err.Error())
                return
        }
        updates := map[string]interface{}{}
        if req.Title != "" {
                updates["title"] = req.Title
        }
        updates["price"] = req.Price
        updates["limit"] = req.Limit
        if req.Outtime != nil {
                updates["outtime"] = req.Outtime
        }
        if req.Info != "" {
                updates["info"] = req.Info
        }
        updates["sort"] = req.Sort
        updates["status"] = req.Status
        if err := h.DB.Model(&coupon).Updates(updates).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        h.DB.First(&coupon, id)
        response.Success(c, coupon)
}

// DeleteCoupon DELETE /product/coupon/:id - delete a coupon
func (h *ProductHandler) DeleteCoupon(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
                response.ErrorBadRequest(c, "invalid id")
                return
        }
        var coupon model.Coupon
        if err := h.DB.First(&coupon, id).Error; err != nil {
                response.Error(c, response.CodeIllegal, "优惠券不存在")
                return
        }
        if err := h.DB.Delete(&coupon).Error; err != nil {
                response.ErrorServer(c)
                return
        }
        response.Success(c, nil)
}
