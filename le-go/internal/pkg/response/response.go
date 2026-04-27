package response

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// Response unified API response structure
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// PageData paginated response data
type PageData struct {
	List     interface{} `json:"list"`
	Total    int64       `json:"total"`
	Page     int         `json:"page"`
	PageSize int         `json:"page_size"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

func SuccessWithMessage(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: message,
		Data:    data,
	})
}

func SuccessPage(c *gin.Context, list interface{}, total int64, page, pageSize int) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data: PageData{
			List:     list,
			Total:    total,
			Page:     page,
			PageSize: pageSize,
		},
	})
}

func Error(c *gin.Context, code int, message string) {
	c.JSON(http.StatusOK, Response{
		Code:    code,
		Message: message,
	})
}

func ErrorUnauthorized(c *gin.Context) {
	c.JSON(http.StatusUnauthorized, Response{
		Code:    -2,
		Message: "unauthorized",
	})
}

func ErrorForbidden(c *gin.Context) {
	c.JSON(http.StatusForbidden, Response{
		Code:    -1,
		Message: "forbidden",
	})
}

func ErrorBadRequest(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, Response{
		Code:    -1,
		Message: message,
	})
}

func ErrorServer(c *gin.Context) {
	c.JSON(http.StatusInternalServerError, Response{
		Code:    -1,
		Message: "internal server error",
	})
}

// Error codes matching the original Django API
const (
	CodeSuccess      = 0
	CodeIllegal      = -1
	CodeLoginTimeout = -2
	CodeInvalidPhone = -3
	CodeInvalidOrder = -4
	CodeSMSError     = -5
	CodePhoneExists  = -6
	CodeLoginFailed  = -7
	CodeInvalidCode  = -8
	CodeUserNotFound = -9
	CodePendingAudit = -10
	CodeInvalidInput = -11
)

var ErrorMessages = map[int]string{
	CodeSuccess:      "操作成功",
	CodeIllegal:      "非法操作",
	CodeLoginTimeout: "登录超时",
	CodeInvalidPhone: "手机号码不合法",
	CodeInvalidOrder: "订单号错误",
	CodeSMSError:     "短信发送失败",
	CodePhoneExists:  "手机号码已注册",
	CodeLoginFailed:  "用户名或密码错误",
	CodeInvalidCode:  "验证码错误",
	CodeUserNotFound: "用户信息不存在",
	CodePendingAudit: "账号等待审核",
	CodeInvalidInput: "信息填写有误",
}

func ErrorCode(code int) string {
	if msg, ok := ErrorMessages[code]; ok {
		return msg
	}
	return "未知错误"
}
