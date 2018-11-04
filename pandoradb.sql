/*
Navicat PGSQL Data Transfer

Source Server         : Myserver
Source Server Version : 90606
Source Host           : localhost:5432
Source Database       : pandoradb
Source Schema         : public

Target Server Type    : PGSQL
Target Server Version : 90606
File Encoding         : 65001

Date: 2018-08-09 08:23:57
*/


-- ----------------------------
-- Sequence structure for article_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."article_id_seq";
CREATE SEQUENCE "public"."article_id_seq"
 INCREMENT 1
 MINVALUE 1
 MAXVALUE 9223372036854775807
 START 9
 CACHE 1;
SELECT setval('"public"."article_id_seq"', 9, true);

-- ----------------------------
-- Sequence structure for session_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."session_id_seq";
CREATE SEQUENCE "public"."session_id_seq"
 INCREMENT 1
 MINVALUE 1
 MAXVALUE 9223372036854775807
 START 104
 CACHE 1;
SELECT setval('"public"."session_id_seq"', 104, true);

-- ----------------------------
-- Sequence structure for users_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."users_id_seq";
CREATE SEQUENCE "public"."users_id_seq"
 INCREMENT 1
 MINVALUE 1
 MAXVALUE 9223372036854775807
 START 47
 CACHE 1;
SELECT setval('"public"."users_id_seq"', 47, true);

-- ----------------------------
-- Table structure for article
-- ----------------------------
DROP TABLE IF EXISTS "public"."article";
CREATE TABLE "public"."article" (
"id" int8 DEFAULT nextval('article_id_seq'::regclass) NOT NULL,
"title" varchar(255) COLLATE "default",
"content" varchar(255) COLLATE "default",
"filename" varchar(255) COLLATE "default",
"kind" int4,
"audience" int8,
"deleted_at" varchar(255) COLLATE "default",
"state" bool,
"created_at" timestamptz(6),
"update" int4
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of article
-- ----------------------------
INSERT INTO "public"."article" VALUES ('1', 'dfsf', null, null, null, null, null, null, '2018-08-08 00:00:00+07', null);
INSERT INTO "public"."article" VALUES ('2', 'fd', null, null, null, null, null, null, '2018-08-08 00:00:00+07', null);
INSERT INTO "public"."article" VALUES ('3', null, null, null, null, null, null, 't', '2018-08-08 00:00:00+07', null);
INSERT INTO "public"."article" VALUES ('4', null, null, null, null, null, null, 't', '2018-08-08 00:00:00+07', null);
INSERT INTO "public"."article" VALUES ('5', 'News', '', null, '1', null, null, 't', '2018-08-08 00:00:00+07', null);
INSERT INTO "public"."article" VALUES ('6', 'News', '', null, '1', null, null, 't', '2018-08-08 00:00:00+07', null);
INSERT INTO "public"."article" VALUES ('7', 'thanks', '', null, '3', null, null, 't', '2018-08-08 00:00:00+07', null);
INSERT INTO "public"."article" VALUES ('9', 'fjdkasjfda;jfdioj', '<p>fafdasfdasfdafa</p>', null, '2', null, null, 't', '2018-08-08 00:00:00+07', null);

-- ----------------------------
-- Table structure for companyinfo
-- ----------------------------
DROP TABLE IF EXISTS "public"."companyinfo";
CREATE TABLE "public"."companyinfo" (
"id" int4 NOT NULL,
"companymail" varchar(255) COLLATE "default",
"password" varchar(255) COLLATE "default"
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of companyinfo
-- ----------------------------
INSERT INTO "public"."companyinfo" VALUES ('1', 'jr19861206@gmail.com', 'kara1001.');

-- ----------------------------
-- Table structure for session
-- ----------------------------
DROP TABLE IF EXISTS "public"."session";
CREATE TABLE "public"."session" (
"id" int8 DEFAULT nextval('session_id_seq'::regclass) NOT NULL,
"userid" int4,
"session_id" varchar COLLATE "default",
"ipaddress" varchar(255) COLLATE "default",
"useragent" varchar(255) COLLATE "default",
"created_at" timestamptz(6),
"expired_at" timestamptz(6)
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of session
-- ----------------------------
INSERT INTO "public"."session" VALUES ('94', '26', '5d85a162-d479-4793-b3cc-db316740a868', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', '2018-08-08 03:11:11.215645+07', '2018-08-10 03:11:11.215+07');
INSERT INTO "public"."session" VALUES ('95', '46', '6efec9c7-416c-439c-82d4-89e070402054', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', '2018-08-08 13:47:28.476679+07', '2018-08-10 13:47:28.476+07');
INSERT INTO "public"."session" VALUES ('96', '47', '9e66bbd0-39d7-48f8-863f-db05d511e34a', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', '2018-08-08 18:51:41.339922+07', '2018-08-09 00:38:10.516+07');
INSERT INTO "public"."session" VALUES ('97', '47', '43139fa6-d398-46e0-8005-2f3b619fb099', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', '2018-08-08 20:57:06.117513+07', '2018-08-09 00:38:10.516+07');
INSERT INTO "public"."session" VALUES ('98', '47', '3de10d9b-6d1c-4290-b748-1e05cd5bc823', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', '2018-08-09 02:00:03.365926+07', '2018-08-09 02:15:21.069+07');
INSERT INTO "public"."session" VALUES ('99', '47', 'e918b4d7-aa1b-4dbd-9de4-b923c0878beb', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', '2018-08-09 02:10:52.794153+07', '2018-08-09 02:15:21.069+07');
INSERT INTO "public"."session" VALUES ('100', '47', 'a5767ec0-c6a7-456e-ab5d-cf5f7224425b', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', '2018-08-09 02:15:58.637398+07', '2018-08-09 02:16:03.282+07');
INSERT INTO "public"."session" VALUES ('101', '47', 'ecb89c8a-4389-49a3-9242-488e99af84e5', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', '2018-08-09 02:18:41.196995+07', '2018-08-09 02:18:46.23+07');
INSERT INTO "public"."session" VALUES ('102', '47', '70d57eb6-7a5b-4ff9-8283-22e092c83573', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', '2018-08-09 02:21:04.184444+07', '2018-08-09 02:21:12.083+07');
INSERT INTO "public"."session" VALUES ('103', '47', '510135e4-c353-468b-9431-ef43830bffae', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', '2018-08-09 02:53:09.969439+07', '2018-08-09 03:01:51.484+07');
INSERT INTO "public"."session" VALUES ('104', '47', '7d0fd126-473e-4ea8-9ef3-fece58101156', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', '2018-08-09 07:43:45.611758+07', '2018-08-09 07:43:57.386+07');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
"id" int8 DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
"username" varchar(255) COLLATE "default",
"email" varchar(255) COLLATE "default",
"password" varchar(255) COLLATE "default",
"secret_question" varchar(255) COLLATE "default",
"secret_answer" varchar(255) COLLATE "default",
"verify_code" varchar(255) COLLATE "default",
"user_agent" varchar(255) COLLATE "default",
"uuid" varchar COLLATE "default",
"ip_address" varchar(255) COLLATE "default",
"created_at" varchar(255) COLLATE "default",
"is_deleted" bool,
"verify" bool
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO "public"."users" VALUES ('47', 'dark', 'hwk-king@outlook.com', 'sha1$8f9b3a24$1$0a7efd09a96edcb69969038861ee512ba5396a86', '1', 'Maria', '14046', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', null, '::1', '2018-08-08 18:50:05.764902+07', 'f', 't');

-- ----------------------------
-- Alter Sequences Owned By 
-- ----------------------------
ALTER SEQUENCE "public"."article_id_seq" OWNED BY "article"."id";
ALTER SEQUENCE "public"."session_id_seq" OWNED BY "session"."id";
ALTER SEQUENCE "public"."users_id_seq" OWNED BY "users"."id";

-- ----------------------------
-- Primary Key structure for table article
-- ----------------------------
ALTER TABLE "public"."article" ADD PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table companyinfo
-- ----------------------------
ALTER TABLE "public"."companyinfo" ADD PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table session
-- ----------------------------
ALTER TABLE "public"."session" ADD PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD PRIMARY KEY ("id");
