/*
 Navicat MySQL Data Transfer

 Source Server         : 本地测试环境
 Source Server Type    : MySQL
 Source Server Version : 80034 (8.0.34)
 Source Host           : localhost:3306
 Source Schema         : test

 Target Server Type    : MySQL
 Target Server Version : 80034 (8.0.34)
 File Encoding         : 65001

 Date: 07/08/2023 00:03:19
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for db_account
-- ----------------------------
DROP TABLE IF EXISTS `db_account`;
CREATE TABLE `db_account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `register_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  UNIQUE KEY `unique_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of db_account
-- ----------------------------
BEGIN;
INSERT INTO `db_account` (`username`, `email`, `password`, `role`, `register_time`) VALUES
  ('admin', 'admin@example.com', '$2y$10$g3x1RonK5rse9jayFxVufu8nT.fhpQNFf0Z11b/CJwlL50E5up5Ri', 'ROLE_USER', NOW()),
  ('manager', 'manager@example.com', '$2y$10$yZxETVEbpt8XDpNEBwMDVuOvzSki5TL0CpzknZLxaL0v5iQyYDIVe', 'ROLE_USER', NOW()),
  ('analyst', 'analyst@example.com', '$2y$10$WvdK32keD0rFkaOKVl7cJe5S4TTX8vFg9ir6sKrh.BdsG.HtrfPj6', 'ROLE_USER', NOW()),
  ('user', 'user@example.com', '$2y$10$abTm5s.xiv85.pDf6zNoU.UZTNi2cbuzKOA6AUX3JsKJztk3MiAKS', 'ROLE_USER', NOW()),
  ('guest', 'guest@example.com', '$2y$10$S0GXZhuNY4V6wH85lDfxtOSUYLP5fdlBJRbaSwd2WMZWqikbjPTeS', 'ROLE_USER', NOW());
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
