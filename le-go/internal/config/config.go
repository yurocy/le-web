package config

import (
	"fmt"
	"github.com/spf13/viper"
	"log"
	"strings"
)

var Cfg *Config

type Config struct {
	Server ServerConfig `mapstructure:"server"`
	Mysql  MysqlConfig  `mapstructure:"mysql"`
	Redis  RedisConfig  `mapstructure:"redis"`
	JWT    JWTConfig    `mapstructure:"jwt"`
	Upload UploadConfig `mapstructure:"upload"`
	SMS    SMSConfig    `mapstructure:"sms"`
}

type ServerConfig struct {
	Port int    `mapstructure:"port"`
	Mode string `mapstructure:"mode"`
}

type MysqlConfig struct {
	Host         string `mapstructure:"host"`
	Port         int    `mapstructure:"port"`
	User         string `mapstructure:"user"`
	Password     string `mapstructure:"password"`
	DBName       string `mapstructure:"dbname"`
	Charset      string `mapstructure:"charset"`
	MaxIdleConns int    `mapstructure:"max_idle_conns"`
	MaxOpenConns int    `mapstructure:"max_open_conns"`
}

type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

type JWTConfig struct {
	Secret      string `mapstructure:"secret"`
	ExpireHours int    `mapstructure:"expire_hours"`
}

type UploadConfig struct {
	Path      string `mapstructure:"path"`
	MaxSize   int    `mapstructure:"max_size"`
	StaticURL string `mapstructure:"static_url"`
}

type SMSConfig struct {
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
}

// DSN returns the MySQL connection string
func (m *MysqlConfig) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=True&loc=Local",
		m.User, m.Password, m.Host, m.Port, m.DBName, m.Charset)
}

// Addr returns the Redis address
func (r *RedisConfig) Addr() string {
	return fmt.Sprintf("%s:%d", r.Host, r.Port)
}

func Init(cfgPath string) {
	v := viper.New()
	v.SetConfigFile(cfgPath)
	v.SetConfigType("yaml")

	// Support environment variable override
	v.AutomaticEnv()
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	if err := v.ReadInConfig(); err != nil {
		log.Fatalf("Failed to read config: %v", err)
	}

	Cfg = &Config{}
	if err := v.Unmarshal(Cfg); err != nil {
		log.Fatalf("Failed to unmarshal config: %v", err)
	}

	log.Println("Config loaded successfully")
}
