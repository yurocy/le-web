package handler

import (
	"le-go/internal/model"
	"le-go/internal/pkg/pagination"
	"le-go/internal/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ==================== WebConfig ====================

// WebGetConfig 获取站点配置
func WebGetConfig(c *gin.Context) {
	var data model.WebConfig
	if err := model.DB.First(&data).Error; err != nil {
		// Return empty config if not exists
		response.Success(c, model.WebConfig{})
		return
	}
	response.Success(c, data)
}

// WebUpdateConfig 更新站点配置
func WebUpdateConfig(c *gin.Context) {
	var data model.WebConfig
	if err := model.DB.First(&data).Error; err != nil {
		// Create if not exists
		data = model.WebConfig{}
	}
	var req model.WebConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if data.ID == 0 {
		if err := model.DB.Create(&req).Error; err != nil {
			response.Error(c, response.CodeIllegal, "创建失败")
			return
		}
		response.Success(c, req)
		return
	}
	if err := model.DB.Model(&data).Updates(map[string]interface{}{
		"webname":      req.Webname,
		"url":          req.URL,
		"address":      req.Address,
		"webtitle":     req.Webtitle,
		"webdesc":      req.Webdesc,
		"webkey":       req.Webkey,
		"copyright":    req.Copyright,
		"record":       req.Record,
		"covered_city": req.CoveredCity,
		"award":        req.Award,
		"award_limit":  req.AwardLimit,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// ==================== WebIndexPic ====================

// WebListIndexPic 获取首页轮播图列表
func WebListIndexPic(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.WebIndexPic
	var total int64

	db := model.DB.Model(&model.WebIndexPic{})
	if v := c.Query("type"); v != "" {
		db = db.Where("type = ?", v)
	}

	db.Count(&total)
	if err := db.Order("sort DESC, id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// WebCreateIndexPic 创建首页轮播图
func WebCreateIndexPic(c *gin.Context) {
	var data model.WebIndexPic
	if err := c.ShouldBindJSON(&data); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if data.Path == "" {
		response.Error(c, response.CodeInvalidInput, "图片路径不能为空")
		return
	}
	if err := model.DB.Create(&data).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建失败")
		return
	}
	response.Success(c, data)
}

// WebUpdateIndexPic 更新首页轮播图
func WebUpdateIndexPic(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.WebIndexPic
	if err := model.DB.First(&data, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "轮播图不存在")
		return
	}
	var req model.WebIndexPic
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if err := model.DB.Model(&data).Updates(map[string]interface{}{
		"title": req.Title,
		"url":   req.URL,
		"path":  req.Path,
		"type":  req.Type,
		"sort":  req.Sort,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// WebDeleteIndexPic 删除首页轮播图
func WebDeleteIndexPic(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.WebIndexPic{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}

// ==================== WebBank ====================

// WebListBank 获取银行列表
func WebListBank(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.WebBank
	var total int64

	db := model.DB.Model(&model.WebBank{})
	if v := c.Query("bankname"); v != "" {
		db = db.Where("bankname LIKE ?", "%"+v+"%")
	}

	db.Count(&total)
	if err := db.Order("sort DESC, id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// WebCreateBank 创建银行
func WebCreateBank(c *gin.Context) {
	var data model.WebBank
	if err := c.ShouldBindJSON(&data); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if data.Bankname == "" {
		response.Error(c, response.CodeInvalidInput, "银行名称不能为空")
		return
	}
	if err := model.DB.Create(&data).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建失败")
		return
	}
	response.Success(c, data)
}

// WebUpdateBank 更新银行
func WebUpdateBank(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.WebBank
	if err := model.DB.First(&data, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "银行不存在")
		return
	}
	var req model.WebBank
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if err := model.DB.Model(&data).Updates(map[string]interface{}{
		"bankname": req.Bankname,
		"banklogo": req.Banklogo,
		"sort":     req.Sort,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// WebDeleteBank 删除银行
func WebDeleteBank(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.WebBank{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}

// ==================== WebProvince ====================

// WebListProvince 获取所有省份列表
func WebListProvince(c *gin.Context) {
	var list []model.WebProvince
	if err := model.DB.Order("sort DESC, id ASC").Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.Success(c, list)
}

// ==================== WebCity ====================

// WebListCity 获取城市列表(按省份)
func WebListCity(c *gin.Context) {
	provID, _ := strconv.Atoi(c.Param("province_id"))
	if provID == 0 {
		response.Error(c, response.CodeInvalidInput, "省份ID不能为空")
		return
	}
	var list []model.WebCity
	if err := model.DB.Where("prov_id = ?", provID).Order("sort DESC, id ASC").Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.Success(c, list)
}

// ==================== WebCounty ====================

// WebListCounty 获取区县列表(按城市)
func WebListCounty(c *gin.Context) {
	cityID, _ := strconv.Atoi(c.Param("city_id"))
	if cityID == 0 {
		response.Error(c, response.CodeInvalidInput, "城市ID不能为空")
		return
	}
	var list []model.WebCounty
	if err := model.DB.Where("city_id = ?", cityID).Order("sort DESC, id ASC").Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.Success(c, list)
}

// ==================== WebMember ====================

// WebListMember 获取会员列表
func WebListMember(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.WebMember
	var total int64

	db := model.DB.Model(&model.WebMember{})
	if v := c.Query("usertel"); v != "" {
		db = db.Where("usertel LIKE ?", "%"+v+"%")
	}
	if v := c.Query("username"); v != "" {
		db = db.Where("username LIKE ?", "%"+v+"%")
	}
	if v := c.Query("city_id"); v != "" {
		db = db.Where("city_id = ?", v)
	}
	if v := c.Query("bank_id"); v != "" {
		db = db.Where("bank_id = ?", v)
	}
	if v := c.Query("pay_meth"); v != "" {
		db = db.Where("pay_meth = ?", v)
	}

	db.Count(&total)
	if err := db.Preload("Bank").Preload("City").
		Order("id DESC").Offset(p.Offset).Limit(p.PageSize).
		Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// WebGetMember 获取会员详情
func WebGetMember(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.WebMember
	if err := model.DB.Preload("Bank").Preload("City").First(&data, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "会员不存在")
		return
	}
	response.Success(c, data)
}

// WebUpdateMember 更新会员信息
func WebUpdateMember(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.WebMember
	if err := model.DB.First(&data, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "会员不存在")
		return
	}
	var req model.WebMember
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if err := model.DB.Model(&data).Updates(map[string]interface{}{
		"username":    req.Username,
		"usertel":     req.UserTel,
		"idcard":      req.IDCard,
		"bank_id":     req.BankID,
		"banknum":     req.BankNum,
		"bankuser":    req.BankUser,
		"we_nickname": req.WeNickname,
		"we_openid":   req.WeOpenID,
		"we_headimg":  req.WeHeadImg,
		"openid":      req.OpenID,
		"zfb":         req.Zfb,
		"city_id":     req.CityID,
		"address":     req.Address,
		"pay_meth":    req.PayMeth,
		"id_pic1":     req.IDPic1,
		"id_pic2":     req.IDPic2,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// WebDeleteMember 删除会员
func WebDeleteMember(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.WebMember{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}

// ==================== WebExpress ====================

// WebListExpress 获取快递公司列表
func WebListExpress(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.WebExpress
	var total int64

	db := model.DB.Model(&model.WebExpress{})
	if v := c.Query("name"); v != "" {
		db = db.Where("name LIKE ?", "%"+v+"%")
	}

	db.Count(&total)
	if err := db.Order("sort DESC, id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// WebCreateExpress 创建快递公司
func WebCreateExpress(c *gin.Context) {
	var data model.WebExpress
	if err := c.ShouldBindJSON(&data); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if data.Name == "" {
		response.Error(c, response.CodeInvalidInput, "快递公司名称不能为空")
		return
	}
	if err := model.DB.Create(&data).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建失败")
		return
	}
	response.Success(c, data)
}

// WebUpdateExpress 更新快递公司
func WebUpdateExpress(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.WebExpress
	if err := model.DB.First(&data, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "快递公司不存在")
		return
	}
	var req model.WebExpress
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if err := model.DB.Model(&data).Updates(map[string]interface{}{
		"name": req.Name,
		"code": req.Code,
		"sort": req.Sort,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// WebDeleteExpress 删除快递公司
func WebDeleteExpress(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.WebExpress{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}
