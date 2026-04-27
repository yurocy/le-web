package pagination

import (
        "github.com/gin-gonic/gin"
        "strconv"
)

const (
        DefaultPage     = 1
        DefaultPageSize = 10
        MaxPageSize     = 100
)

// Params parsed pagination parameters
type Params struct {
        Page     int
        PageSize int
        Offset   int
}

// GetParams extracts pagination params from gin context
// Supports both GET query params and POST form data
func GetParams(c *gin.Context) Params {
        page, _ := strconv.Atoi(c.DefaultQuery("page", c.DefaultPostForm("page", "1")))
        pageSize, _ := strconv.Atoi(c.DefaultQuery("size", c.DefaultPostForm("size", "10")))

        if page < 1 {
                page = DefaultPage
        }
        if pageSize < 1 {
                pageSize = DefaultPageSize
        }
        if pageSize > MaxPageSize {
                pageSize = MaxPageSize
        }

        return Params{
                Page:     page,
                PageSize: pageSize,
                Offset:   (page - 1) * pageSize,
        }
}

// Offset calculates SQL offset
func Offset(page, pageSize int) int {
        if page < 1 {
                page = 1
        }
        return (page - 1) * pageSize
}
