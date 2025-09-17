/*
 Navicat Premium Data Transfer

 Source Server         : localhost_5432
 Source Server Type    : PostgreSQL
 Source Server Version : 160001 (160001)
 Source Host           : localhost:5432
 Source Catalog        : Chatgram
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 160001 (160001)
 File Encoding         : 65001

 Date: 08/06/2024 00:39:23
*/

-- ----------------------------
-- Sequence structure for Messages_Id_seq
-- ----------------------------
CREATE SEQUENCE IF NOT EXISTS "public"."Products_Id_seq";

-- ----------------------------
-- Table structure for Products
-- ----------------------------
DROP TABLE IF EXISTS "public"."Products";
CREATE TABLE "public"."Products" (
  "Id" int4 NOT NULL DEFAULT nextval('"Products_Id_seq"'::regclass),
  "User_Id" int8,
  "Product_Name" varchar(255) COLLATE "pg_catalog"."default",
  "Price" numeric(10,2),
  "Photo_Name" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of Products
-- ----------------------------
INSERT INTO "public"."Products" VALUES (70, 66, 'Consultation on Technology', 3400.00, '1717473948170.jpg');
INSERT INTO "public"."Products" VALUES (68, 66, 'Web developmemt', 234.00, '1717473983081.jpg');
INSERT INTO "public"."Products" VALUES (71, 66, 'Recruitment', 2000.00, '1717507109805.jpg');
INSERT INTO "public"."Products" VALUES (69, 66, 'Real Estate', 324.00, '1717456081979.jpg');

-- ----------------------------
-- Primary Key structure for table Products
-- ----------------------------
ALTER TABLE "public"."Products" ADD CONSTRAINT "Products_pkey1" PRIMARY KEY ("Id");
