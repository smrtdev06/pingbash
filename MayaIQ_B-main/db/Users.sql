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

 Date: 08/06/2024 00:39:49
*/

-- ----------------------------
-- Sequence structure for users_id_seq
-- ----------------------------
CREATE SEQUENCE "public"."users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    
-- ----------------------------
-- Table structure for Users
-- ----------------------------
DROP TABLE IF EXISTS "public"."Users";
CREATE TABLE "public"."Users" (
  "Id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  "Name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "Email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "Password" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "Description" text COLLATE "pg_catalog"."default",
  "Address" varchar(255) COLLATE "pg_catalog"."default",
  "Geometry" jsonb,
  "Role" int4,
  "Profession" varchar(255) COLLATE "pg_catalog"."default" DEFAULT 2,
  "LocationType" int4 NOT NULL DEFAULT 0,
  "Photo_Name" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of Users
-- ----------------------------
INSERT INTO "public"."Users" VALUES (76, 'vendor', 'vendor10@outlook.com', '$2a$10$5SVWs85hN9gpfz3B9VNxIOGOYmYPvlZDp2CmI.KaONjUnjD2O9OE6', NULL, 'United States Virgin Islands', '{"lat": 18.34307527604996, "lng": -64.91136038565952}', 3, 'AI developer', 0, NULL);
INSERT INTO "public"."Users" VALUES (78, 'David Martin', 'dedicatedsofter@gmail.com', '$2a$10$zq4VplL0ePPplUVvOiSNiOLW3omGtDxKgT5ISWoijRL2k8giyvmIu', 'I am versed in AI', 'United States', '{"lat": 37.81262218684731, "lng": -122.34821777696311}', 1, 'CEO', 0, '');
INSERT INTO "public"."Users" VALUES (24, 'Davies Martin', 'customer2@outlook.com', '$2a$10$KueJ2I5hl9i2lYlACHrnlejhvoVni6ghxaCfWWDN4hzJF9meOmA8G', '', 'United States Virgin Islands', '{"lat": 18.35, "lng": -64.933333}', 1, 'Recruiter', 0, NULL);
INSERT INTO "public"."Users" VALUES (21, 'vendor7', 'vendor7@outlook.com', '$2a$10$pL0MRKKiiKnc6G4lvFwcyOcaiaanfzpx8zvVwLWX7bXOLld6u6Ym2', '', 'Ukraine', '{"lat": 55, "lng": 55}', 0, 'Wedding planner', 0, NULL);
INSERT INTO "public"."Users" VALUES (18, 'vendor4', 'vendor4@outlook.com', '$2a$10$ZXEI7ocCsfLKtItSDo36Ve4r17.JFPv78daW8wGrnwDzhy.zlGHCq', '', 'Ukraine', '{"lat": 55, "lng": 55}', 0, 'Mechanic', 0, NULL);
INSERT INTO "public"."Users" VALUES (16, 'vendor2', 'Vendor2@outlook.com', '$2a$10$rV./CSsxcduYeE4lOfzh/Odb3JUFQbCKOh4dII0iAKpjxhxCe7E8S', '', 'Ukraine', '{"lat": 55, "lng": 55}', 0, 'Clothing', 0, NULL);
INSERT INTO "public"."Users" VALUES (65, 'customer7', 'smartmydevworld@gmail.com', '$2a$10$5pBr/UeSf/0Id0f5oUGXXut7Pmv2salCDGJj6NQlFxa9.XgQsWSii', NULL, 'Somalia', '{"lat": 10, "lng": 49}', 1, 'CFO', 0, '');
INSERT INTO "public"."Users" VALUES (77, 'David', 'dedicatedsofter@outlook.com', '$2a$10$L2i2pjriKgltjVEe28Qfze8vN.WjQGGfRza.yQEdxAlLAX2356R.S', NULL, 'United States Minor Outlying Islands', '{"lat": 0, "lng": 0}', 3, 'AI developer', 0, NULL);
INSERT INTO "public"."Users" VALUES (79, 'Rudolf', 'miraclefof@hotmail.com', '$2a$10$G3jUHmIbk3O5voDKhA8OqOhczHWCxJtz6aeC1Hf7aWqQQShvPOA0W', NULL, 'Saint Kitts and Nevis', '{"lat": 0, "lng": 0}', 0, 'Super dev', 0, NULL);
INSERT INTO "public"."Users" VALUES (34, 'customer4', 'star21302fof@hotmail.com', '$2a$10$ha24QsA9szA9iqEZ.VqF1uEK0xzKeilY3DBqTLzvwObdxFEB.VMHq', '', 'Ukraine', '{"lat": 0, "lng": 0}', 1, 'CTO', 0, NULL);
INSERT INTO "public"."Users" VALUES (33, 'customer3', 'star21301fof@outlook.com', '$2a$10$aQ.4Jy3ePPNfNczBg6ugCODC8O9/8TaSa/i14SIruUCEYi67hqkem', '', 'United States', '{"lat": 0, "lng": 0}', 1, 'CEO', 0, NULL);
INSERT INTO "public"."Users" VALUES (35, 'customer1', 'star21303fof@hotmail.com', '$2a$10$ybxCedXqThnP5UkCpzFBueHm06bKpKiXy3q9t2iLsGIqpPUHZxskG', '', 'Ukraine', '{"lat": 49, "lng": 32}', 1, 'CFO', 0, NULL);
INSERT INTO "public"."Users" VALUES (23, 'vendor1', 'vendor1@outlook.com', '$2a$10$98ZwDh5fAcTbLKVwrTojUe.8pz83Q8rxUOJMtBwAMNejXCOCwYXQi', '', 'united state', '{"lat": 55, "lng": 55}', 0, 'Software developer', 0, NULL);
INSERT INTO "public"."Users" VALUES (22, 'vendor8', 'vendor8@outlook.com', '$2a$10$x/WwY/KZM6UDUPKRkmXqYOFwGawQWh46koQifljj/q0Jf3RhdooJS', '', 'Ukraine', '{"lat": 55, "lng": 55}', 0, 'Wedding Planner', 0, NULL);
INSERT INTO "public"."Users" VALUES (73, 'customer9', 'customer9@outlook.com', '$2a$10$gRyjQKEbpbUf44DTJ/amQua9hWqBCGzR8xCNwpOkihEog3fh80q9G', NULL, 'United States', '{"lat": 38.05038619556264, "lng": -96.64019779581575}', 1, 'CTO', 0, NULL);
INSERT INTO "public"."Users" VALUES (71, 'Silvestru Macoveiciuc', 'svmacoveiciuc@gmail.com', '$2a$10$3jZCTxKLvsb6ik0QJZfeDek.QI4P.NaGzbFTXflCe8S3zuuVAb1XK', NULL, 'Dublin', '{"lat": 0, "lng": 0}', 0, 'Event Manager', 0, NULL);
INSERT INTO "public"."Users" VALUES (72, 'Silvestru Macoveiciuc', 'svmacoveiciuc@mailinator.com', '$2a$10$Q.YyTh7OWO3pyh1Meijfj.aXSWP4UwcHNAPaNKVr/nb3hy71GZEbS', NULL, 'Dublin', '{"lat": 0, "lng": 0}', 1, 'Manager', 0, NULL);
INSERT INTO "public"."Users" VALUES (32, 'customer5', 'star21301fof@hotmail.com', '$2a$10$qICRjV.mdPbDnFOVvKIn8OT8nLctGksvgA2DisdxcLRhlVpd.ii9m', '', 'United States', '{"lat": 0, "lng": 0}', 1, 'Agency', 0, NULL);
INSERT INTO "public"."Users" VALUES (25, 'customer6', 'handsome@gmail.com', '$2a$10$wwZT4Hkhp1QWqmtS3yLLkeL2ehmNon4CVhvxmm.QgyJoLr2ddmswW', '', 'United States Virgin Islands', '{"lat": 18.35, "lng": -64.933333}', 1, 'CEO', 0, NULL);
INSERT INTO "public"."Users" VALUES (80, 'Davies', 'ddd@outlook.com', '$2a$10$/gStC3sECduki5sB5rE33.jYE1XwIGnUT6Y3pYsWPDc9GG5HiGB9y', NULL, 'united states', '{"lat": 37.81987018886422, "lng": -122.37957456054687}', 3, 'web developer', 0, NULL);
INSERT INTO "public"."Users" VALUES (17, 'vendor3', 'Vendor3@outlook.com', '$2a$10$EjiKsvviuEzTzzrqSPajeem3MLmvaJBJbwiHptVeeGATkKx.lgFiO', '', 'Ukraine', '{"lat": 55, "lng": 55}', 0, 'Web developer', 0, NULL);
INSERT INTO "public"."Users" VALUES (81, 'Grichdsa', 'highestfof@hotmail.com', '$2a$10$aiZrRp244hPM48r979cikedBIviS71LZjfxJtofEi/QlAiOuKxFJG', NULL, '2960 Champion Way Apt 2407', '{"lat": 0, "lng": 0}', 4, 'sdf', 0, NULL);
INSERT INTO "public"."Users" VALUES (82, 'wer', 'star21605fof@hotmail.com', '$2a$10$BI8NeO57wjSoyPONoBNGL.8ARpaFqN/xCE3zGzilxZoOWafdV8Rle', NULL, '2960 Champion Way Apt 2407', '{"lat": 0, "lng": 0}', 3, 'ss', 0, NULL);
INSERT INTO "public"."Users" VALUES (19, 'vendor5', 'vendor5@outlook.com', '$2a$10$6y5X2E2JFTrNBW7hA2OE6uBdx5IA3gmc4.umNHTfL8jU02TMPcK.q', '', 'Ukraine', '{"lat": 55, "lng": 55}', 0, 'Web developer', 0, '');
INSERT INTO "public"."Users" VALUES (20, 'Davies Martin', 'davies@outlook.com', '$2a$10$x/WwY/KZM6UDUPKRkmXqYOFwGawQWh46koQifljj/q0Jf3RhdooJS', 'unit', 'United States Virgin Islands', '{"lat": 55, "lng": 55}', 0, 'AI developer', 0, '');
INSERT INTO "public"."Users" VALUES (83, 'Silvestru Macoveiciuc', 'test@mail.com', '$2a$10$ZX0T7SIXJ.ea0xbmeKPfN.tK.UtAyxhVnK9nKBcGvyV1T9iLmXaX.', NULL, 'Dublin, Ireland', '{"lat": 0, "lng": 0}', 4, 'Selling rabbits', 0, NULL);
INSERT INTO "public"."Users" VALUES (66, 'vendor9 df', 'dmytro247@hotmail.com', '$2a$10$cDYli90yudFo4amSt2TIwuyC1YpLbMLqLqLM3bJxeouPzy6HIGKZi', 'lkjhg', 'Moldova', '{"lat": 0, "lng": 0}', 0, 'Agency', 0, '1717459125928.jpg');

-- ----------------------------
-- Primary Key structure for table Users
-- ----------------------------
ALTER TABLE "public"."Users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("Id");
