package handler

import (
	"le-go/internal/model"
	"le-go/internal/pkg/pagination"
	"le-go/internal/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ==================== NewsCategory ====================

// ArticleListCategory 获取文章分类列表
func ArticleListCategory(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.NewsCategory
	var total int64

	db := model.DB.Model(&model.NewsCategory{})
	if v := c.Query("classname"); v != "" {
		db = db.Where("classname LIKE ?", "%"+v+"%")
	}

	db.Count(&total)
	if err := db.Order("id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// ArticleCreateCategory 创建文章分类
func ArticleCreateCategory(c *gin.Context) {
	var data model.NewsCategory
	if err := c.ShouldBindJSON(&data); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if data.Classname == "" {
		response.Error(c, response.CodeInvalidInput, "分类名称不能为空")
		return
	}
	if err := model.DB.Create(&data).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建失败")
		return
	}
	response.Success(c, data)
}

// ArticleUpdateCategory 更新文章分类
func ArticleUpdateCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.NewsCategory
	if err := model.DB.First(&data, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "分类不存在")
		return
	}
	var req model.NewsCategory
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if err := model.DB.Model(&data).Updates(map[string]interface{}{
		"classname": req.Classname,
		"info":      req.Info,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// ArticleDeleteCategory 删除文章分类
func ArticleDeleteCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.NewsCategory{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}

// ==================== NewsArticle ====================

// ArticleListArticle 获取文章列表
func ArticleListArticle(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.NewsArticle
	var total int64

	db := model.DB.Model(&model.NewsArticle{})
	if v := c.Query("category_id"); v != "" {
		db = db.Where("category_id = ?", v)
	}
	if v := c.Query("ishot"); v != "" {
		db = db.Where("ishot = ?", v)
	}
	if v := c.Query("title"); v != "" {
		db = db.Where("title LIKE ?", "%"+v+"%")
	}

	db.Count(&total)
	if err := db.Preload("Category").
		Order("id DESC").Offset(p.Offset).Limit(p.PageSize).
		Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// ArticleGetArticle 获取文章详情
func ArticleGetArticle(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.NewsArticle
	if err := model.DB.Preload("Category").First(&data, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "文章不存在")
		return
	}
	response.Success(c, data)
}

// ArticleCreateArticle 创建文章
func ArticleCreateArticle(c *gin.Context) {
	var data model.NewsArticle
	if err := c.ShouldBindJSON(&data); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if data.Title == "" {
		response.Error(c, response.CodeInvalidInput, "文章标题不能为空")
		return
	}
	if data.CategoryID == 0 {
		response.Error(c, response.CodeInvalidInput, "请选择文章分类")
		return
	}
	if err := model.DB.Create(&data).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建失败")
		return
	}
	response.Success(c, data)
}

// ArticleUpdateArticle 更新文章
func ArticleUpdateArticle(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.NewsArticle
	if err := model.DB.First(&data, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "文章不存在")
		return
	}
	var req model.NewsArticle
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if err := model.DB.Model(&data).Updates(map[string]interface{}{
		"title":       req.Title,
		"info":        req.Info,
		"category_id": req.CategoryID,
		"ishot":       req.Ishot,
		"keyword":     req.Keyword,
		"content":     req.Content,
		"date":        req.Date,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// ArticleDeleteArticle 删除文章
func ArticleDeleteArticle(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.NewsArticle{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}

// ==================== Comment ====================

// ArticleListComment 获取评论列表
func ArticleListComment(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.Comment
	var total int64

	db := model.DB.Model(&model.Comment{})
	if v := c.Query("type"); v != "" {
		db = db.Where("type = ?", v)
	}
	if v := c.Query("order_id"); v != "" {
		db = db.Where("order_id = ?", v)
	}
	if v := c.Query("agent_id"); v != "" {
		db = db.Where("agent_id = ?", v)
	}

	db.Count(&total)
	if err := db.Order("id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// ArticleDeleteComment 删除评论
func ArticleDeleteComment(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.Comment{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}
