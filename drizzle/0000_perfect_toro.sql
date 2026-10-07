CREATE TABLE "categorias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurante_id" uuid,
	"nome" text NOT NULL,
	"ordem" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurante_id" uuid,
	"cliente_nome" text,
	"cliente_whatsapp" text,
	"itens" jsonb NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pendente',
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "produtos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"categoria_id" uuid,
	"nome" text NOT NULL,
	"descricao" text,
	"preco" numeric(10, 2) NOT NULL,
	"imagem_url" text,
	"disponivel" boolean DEFAULT true,
	"ordem" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "restaurantes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nome" text NOT NULL,
	"whatsapp" text,
	"logo_url" text,
	"cor_primaria" text DEFAULT '#c0392b',
	"aberto" boolean DEFAULT true,
	"criado_em" timestamp DEFAULT now(),
	CONSTRAINT "restaurantes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_restaurante_id_restaurantes_id_fk" FOREIGN KEY ("restaurante_id") REFERENCES "public"."restaurantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_restaurante_id_restaurantes_id_fk" FOREIGN KEY ("restaurante_id") REFERENCES "public"."restaurantes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;