/*
 Navicat Premium Data Transfer

 Source Server         : Chatgram
 Source Server Type    : PostgreSQL
 Source Server Version : 160003 (160003)
 Source Host           : localhost:5432
 Source Catalog        : Chatgram
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 160003 (160003)
 File Encoding         : 65001

 Date: 10/06/2024 03:45:28
*/


-- ----------------------------
-- Table structure for Messages
-- ----------------------------
DROP TABLE IF EXISTS "public"."Messages";
CREATE TABLE "public"."Messages" (
  "Id" int4 NOT NULL DEFAULT nextval('"Messages_Id_seq"'::regclass),
  "Content" varchar(255) COLLATE "pg_catalog"."default",
  "Sender_Id" int4,
  "Send_Time" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "Receiver_Id" int4,
  "Read_Time" timestamp(0),
  "History_Iden" int2
)
;

-- ----------------------------
-- Records of Messages
-- ----------------------------
INSERT INTO "public"."Messages" VALUES (3, 'Hi, how are you?', 20, '2024-06-09 09:50:04', 25, '2024-06-09 09:50:42', 0);
INSERT INTO "public"."Messages" VALUES (4, 'What are you doing?', 20, '2024-06-09 09:50:41', 25, '2024-06-09 09:50:42', 0);
INSERT INTO "public"."Messages" VALUES (5, 'I am fine and you?', 25, '2024-06-09 09:52:09', 20, NULL, 0);
INSERT INTO "public"."Messages" VALUES (7, 'Hi how are you', 78, '2024-06-09 09:57:54', 20, NULL, 1);
INSERT INTO "public"."Messages" VALUES (8, 'Hi ', 78, '2024-06-09 09:58:32', 20, NULL, 0);
INSERT INTO "public"."Messages" VALUES (6, 'I am relaxing', 25, '2024-06-09 09:57:18', 20, NULL, 0);

-- ----------------------------
-- Primary Key structure for table Messages
-- ----------------------------
ALTER TABLE "public"."Messages" ADD CONSTRAINT "Messages_pkey" PRIMARY KEY ("Id");
