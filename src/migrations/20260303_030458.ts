import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_prompt_tests_execution_status" AS ENUM('pending', 'running', 'completed', 'failed');
  CREATE TYPE "public"."enum__prompt_tests_v_version_execution_status" AS ENUM('pending', 'running', 'completed', 'failed');
  CREATE TYPE "public"."enum_llm_providers_provider_type" AS ENUM('openai', 'anthropic', 'google', 'cohere', 'huggingface', 'azure-openai', 'aws-bedrock', 'custom');
  CREATE TYPE "public"."enum_llm_providers_auth_type" AS ENUM('api-key', 'bearer', 'oauth', 'none');
  CREATE TYPE "public"."enum_llm_providers_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__llm_providers_v_version_provider_type" AS ENUM('openai', 'anthropic', 'google', 'cohere', 'huggingface', 'azure-openai', 'aws-bedrock', 'custom');
  CREATE TYPE "public"."enum__llm_providers_v_version_auth_type" AS ENUM('api-key', 'bearer', 'oauth', 'none');
  CREATE TYPE "public"."enum__llm_providers_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_llm_models_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__llm_models_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "llm_providers_models" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"model_id" varchar,
  	"display_name" varchar,
  	"max_tokens" numeric
  );
  
  CREATE TABLE "llm_providers_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "llm_providers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"provider_type" "enum_llm_providers_provider_type" DEFAULT 'custom',
  	"icon" varchar,
  	"owner_id" integer,
  	"auth_type" "enum_llm_providers_auth_type" DEFAULT 'api-key',
  	"api_key" varchar,
  	"api_endpoint" varchar,
  	"api_version" varchar,
  	"region" varchar,
  	"rate_limit" numeric,
  	"rate_limit_window" numeric,
  	"quota" numeric,
  	"cost_per_mill_tokens" numeric,
  	"enabled" boolean DEFAULT true,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_llm_providers_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_llm_providers_v_version_models" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"model_id" varchar,
  	"display_name" varchar,
  	"max_tokens" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_llm_providers_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_llm_providers_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_display_name" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_provider_type" "enum__llm_providers_v_version_provider_type" DEFAULT 'custom',
  	"version_icon" varchar,
  	"version_owner_id" integer,
  	"version_auth_type" "enum__llm_providers_v_version_auth_type" DEFAULT 'api-key',
  	"version_api_key" varchar,
  	"version_api_endpoint" varchar,
  	"version_api_version" varchar,
  	"version_region" varchar,
  	"version_rate_limit" numeric,
  	"version_rate_limit_window" numeric,
  	"version_quota" numeric,
  	"version_cost_per_mill_tokens" numeric,
  	"version_enabled" boolean DEFAULT true,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__llm_providers_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "llm_models_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "llm_models_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"capability" varchar
  );
  
  CREATE TABLE "llm_models" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"model_id" varchar,
  	"description" varchar,
  	"provider_id" integer,
  	"context_length" numeric,
  	"max_tokens" numeric,
  	"supports_streaming" boolean DEFAULT false,
  	"supports_function_calling" boolean DEFAULT false,
  	"cost_per_mill_tokens" numeric,
  	"cost_per_input_token" numeric,
  	"cost_per_output_token" numeric,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_llm_models_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_llm_models_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_llm_models_v_version_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"capability" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_llm_models_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_display_name" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_model_id" varchar,
  	"version_description" varchar,
  	"version_provider_id" integer,
  	"version_context_length" numeric,
  	"version_max_tokens" numeric,
  	"version_supports_streaming" boolean DEFAULT false,
  	"version_supports_function_calling" boolean DEFAULT false,
  	"version_cost_per_mill_tokens" numeric,
  	"version_cost_per_input_token" numeric,
  	"version_cost_per_output_token" numeric,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__llm_models_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  ALTER TABLE "prompt_tests" ADD COLUMN "execution_status" "enum_prompt_tests_execution_status" DEFAULT 'pending';
  ALTER TABLE "_prompt_tests_v" ADD COLUMN "version_execution_status" "enum__prompt_tests_v_version_execution_status" DEFAULT 'pending';
  ALTER TABLE "search_rels" ADD COLUMN "llm_providers_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "llm_models_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "llm_providers_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "llm_models_id" integer;
  ALTER TABLE "llm_providers_models" ADD CONSTRAINT "llm_providers_models_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."llm_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "llm_providers_tags" ADD CONSTRAINT "llm_providers_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."llm_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "llm_providers" ADD CONSTRAINT "llm_providers_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "llm_providers" ADD CONSTRAINT "llm_providers_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_llm_providers_v_version_models" ADD CONSTRAINT "_llm_providers_v_version_models_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_llm_providers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_llm_providers_v_version_tags" ADD CONSTRAINT "_llm_providers_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_llm_providers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_llm_providers_v" ADD CONSTRAINT "_llm_providers_v_parent_id_llm_providers_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."llm_providers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_llm_providers_v" ADD CONSTRAINT "_llm_providers_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_llm_providers_v" ADD CONSTRAINT "_llm_providers_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "llm_models_tags" ADD CONSTRAINT "llm_models_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."llm_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "llm_models_capabilities" ADD CONSTRAINT "llm_models_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."llm_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "llm_models" ADD CONSTRAINT "llm_models_provider_id_llm_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."llm_providers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "llm_models" ADD CONSTRAINT "llm_models_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_llm_models_v_version_tags" ADD CONSTRAINT "_llm_models_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_llm_models_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_llm_models_v_version_capabilities" ADD CONSTRAINT "_llm_models_v_version_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_llm_models_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_llm_models_v" ADD CONSTRAINT "_llm_models_v_parent_id_llm_models_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."llm_models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_llm_models_v" ADD CONSTRAINT "_llm_models_v_version_provider_id_llm_providers_id_fk" FOREIGN KEY ("version_provider_id") REFERENCES "public"."llm_providers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_llm_models_v" ADD CONSTRAINT "_llm_models_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "llm_providers_models_order_idx" ON "llm_providers_models" USING btree ("_order");
  CREATE INDEX "llm_providers_models_parent_id_idx" ON "llm_providers_models" USING btree ("_parent_id");
  CREATE INDEX "llm_providers_tags_order_idx" ON "llm_providers_tags" USING btree ("_order");
  CREATE INDEX "llm_providers_tags_parent_id_idx" ON "llm_providers_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "llm_providers_slug_idx" ON "llm_providers" USING btree ("slug");
  CREATE INDEX "llm_providers_owner_idx" ON "llm_providers" USING btree ("owner_id");
  CREATE INDEX "llm_providers_meta_meta_image_idx" ON "llm_providers" USING btree ("meta_image_id");
  CREATE INDEX "llm_providers_updated_at_idx" ON "llm_providers" USING btree ("updated_at");
  CREATE INDEX "llm_providers_created_at_idx" ON "llm_providers" USING btree ("created_at");
  CREATE INDEX "llm_providers__status_idx" ON "llm_providers" USING btree ("_status");
  CREATE INDEX "_llm_providers_v_version_models_order_idx" ON "_llm_providers_v_version_models" USING btree ("_order");
  CREATE INDEX "_llm_providers_v_version_models_parent_id_idx" ON "_llm_providers_v_version_models" USING btree ("_parent_id");
  CREATE INDEX "_llm_providers_v_version_tags_order_idx" ON "_llm_providers_v_version_tags" USING btree ("_order");
  CREATE INDEX "_llm_providers_v_version_tags_parent_id_idx" ON "_llm_providers_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_llm_providers_v_parent_idx" ON "_llm_providers_v" USING btree ("parent_id");
  CREATE INDEX "_llm_providers_v_version_version_slug_idx" ON "_llm_providers_v" USING btree ("version_slug");
  CREATE INDEX "_llm_providers_v_version_version_owner_idx" ON "_llm_providers_v" USING btree ("version_owner_id");
  CREATE INDEX "_llm_providers_v_version_meta_version_meta_image_idx" ON "_llm_providers_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_llm_providers_v_version_version_updated_at_idx" ON "_llm_providers_v" USING btree ("version_updated_at");
  CREATE INDEX "_llm_providers_v_version_version_created_at_idx" ON "_llm_providers_v" USING btree ("version_created_at");
  CREATE INDEX "_llm_providers_v_version_version__status_idx" ON "_llm_providers_v" USING btree ("version__status");
  CREATE INDEX "_llm_providers_v_created_at_idx" ON "_llm_providers_v" USING btree ("created_at");
  CREATE INDEX "_llm_providers_v_updated_at_idx" ON "_llm_providers_v" USING btree ("updated_at");
  CREATE INDEX "_llm_providers_v_latest_idx" ON "_llm_providers_v" USING btree ("latest");
  CREATE INDEX "_llm_providers_v_autosave_idx" ON "_llm_providers_v" USING btree ("autosave");
  CREATE INDEX "llm_models_tags_order_idx" ON "llm_models_tags" USING btree ("_order");
  CREATE INDEX "llm_models_tags_parent_id_idx" ON "llm_models_tags" USING btree ("_parent_id");
  CREATE INDEX "llm_models_capabilities_order_idx" ON "llm_models_capabilities" USING btree ("_order");
  CREATE INDEX "llm_models_capabilities_parent_id_idx" ON "llm_models_capabilities" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "llm_models_slug_idx" ON "llm_models" USING btree ("slug");
  CREATE INDEX "llm_models_provider_idx" ON "llm_models" USING btree ("provider_id");
  CREATE INDEX "llm_models_meta_meta_image_idx" ON "llm_models" USING btree ("meta_image_id");
  CREATE INDEX "llm_models_updated_at_idx" ON "llm_models" USING btree ("updated_at");
  CREATE INDEX "llm_models_created_at_idx" ON "llm_models" USING btree ("created_at");
  CREATE INDEX "llm_models__status_idx" ON "llm_models" USING btree ("_status");
  CREATE INDEX "_llm_models_v_version_tags_order_idx" ON "_llm_models_v_version_tags" USING btree ("_order");
  CREATE INDEX "_llm_models_v_version_tags_parent_id_idx" ON "_llm_models_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_llm_models_v_version_capabilities_order_idx" ON "_llm_models_v_version_capabilities" USING btree ("_order");
  CREATE INDEX "_llm_models_v_version_capabilities_parent_id_idx" ON "_llm_models_v_version_capabilities" USING btree ("_parent_id");
  CREATE INDEX "_llm_models_v_parent_idx" ON "_llm_models_v" USING btree ("parent_id");
  CREATE INDEX "_llm_models_v_version_version_slug_idx" ON "_llm_models_v" USING btree ("version_slug");
  CREATE INDEX "_llm_models_v_version_version_provider_idx" ON "_llm_models_v" USING btree ("version_provider_id");
  CREATE INDEX "_llm_models_v_version_meta_version_meta_image_idx" ON "_llm_models_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_llm_models_v_version_version_updated_at_idx" ON "_llm_models_v" USING btree ("version_updated_at");
  CREATE INDEX "_llm_models_v_version_version_created_at_idx" ON "_llm_models_v" USING btree ("version_created_at");
  CREATE INDEX "_llm_models_v_version_version__status_idx" ON "_llm_models_v" USING btree ("version__status");
  CREATE INDEX "_llm_models_v_created_at_idx" ON "_llm_models_v" USING btree ("created_at");
  CREATE INDEX "_llm_models_v_updated_at_idx" ON "_llm_models_v" USING btree ("updated_at");
  CREATE INDEX "_llm_models_v_latest_idx" ON "_llm_models_v" USING btree ("latest");
  CREATE INDEX "_llm_models_v_autosave_idx" ON "_llm_models_v" USING btree ("autosave");
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_llm_providers_fk" FOREIGN KEY ("llm_providers_id") REFERENCES "public"."llm_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_llm_models_fk" FOREIGN KEY ("llm_models_id") REFERENCES "public"."llm_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_llm_providers_fk" FOREIGN KEY ("llm_providers_id") REFERENCES "public"."llm_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_llm_models_fk" FOREIGN KEY ("llm_models_id") REFERENCES "public"."llm_models"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "search_rels_llm_providers_id_idx" ON "search_rels" USING btree ("llm_providers_id");
  CREATE INDEX "search_rels_llm_models_id_idx" ON "search_rels" USING btree ("llm_models_id");
  CREATE INDEX "payload_locked_documents_rels_llm_providers_id_idx" ON "payload_locked_documents_rels" USING btree ("llm_providers_id");
  CREATE INDEX "payload_locked_documents_rels_llm_models_id_idx" ON "payload_locked_documents_rels" USING btree ("llm_models_id");
  ALTER TABLE "prompt_tests" DROP COLUMN "status";
  ALTER TABLE "_prompt_tests_v" DROP COLUMN "version_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "llm_providers_models" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "llm_providers_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "llm_providers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_llm_providers_v_version_models" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_llm_providers_v_version_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_llm_providers_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "llm_models_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "llm_models_capabilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "llm_models" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_llm_models_v_version_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_llm_models_v_version_capabilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_llm_models_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "llm_providers_models" CASCADE;
  DROP TABLE "llm_providers_tags" CASCADE;
  DROP TABLE "llm_providers" CASCADE;
  DROP TABLE "_llm_providers_v_version_models" CASCADE;
  DROP TABLE "_llm_providers_v_version_tags" CASCADE;
  DROP TABLE "_llm_providers_v" CASCADE;
  DROP TABLE "llm_models_tags" CASCADE;
  DROP TABLE "llm_models_capabilities" CASCADE;
  DROP TABLE "llm_models" CASCADE;
  DROP TABLE "_llm_models_v_version_tags" CASCADE;
  DROP TABLE "_llm_models_v_version_capabilities" CASCADE;
  DROP TABLE "_llm_models_v" CASCADE;
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_llm_providers_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_llm_models_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_llm_providers_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_llm_models_fk";
  
  DROP INDEX "search_rels_llm_providers_id_idx";
  DROP INDEX "search_rels_llm_models_id_idx";
  DROP INDEX "payload_locked_documents_rels_llm_providers_id_idx";
  DROP INDEX "payload_locked_documents_rels_llm_models_id_idx";
  ALTER TABLE "prompt_tests" ADD COLUMN "status" "enum_prompt_tests_status" DEFAULT 'pending';
  ALTER TABLE "_prompt_tests_v" ADD COLUMN "version_status" "enum__prompt_tests_v_version_status" DEFAULT 'pending';
  ALTER TABLE "prompt_tests" DROP COLUMN "execution_status";
  ALTER TABLE "_prompt_tests_v" DROP COLUMN "version_execution_status";
  ALTER TABLE "search_rels" DROP COLUMN "llm_providers_id";
  ALTER TABLE "search_rels" DROP COLUMN "llm_models_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "llm_providers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "llm_models_id";
  DROP TYPE "public"."enum_prompt_tests_execution_status";
  DROP TYPE "public"."enum__prompt_tests_v_version_execution_status";
  DROP TYPE "public"."enum_llm_providers_provider_type";
  DROP TYPE "public"."enum_llm_providers_auth_type";
  DROP TYPE "public"."enum_llm_providers_status";
  DROP TYPE "public"."enum__llm_providers_v_version_provider_type";
  DROP TYPE "public"."enum__llm_providers_v_version_auth_type";
  DROP TYPE "public"."enum__llm_providers_v_version_status";
  DROP TYPE "public"."enum_llm_models_status";
  DROP TYPE "public"."enum__llm_models_v_version_status";`)
}
