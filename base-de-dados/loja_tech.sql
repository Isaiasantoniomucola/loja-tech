SET NAMES utf8mb4;
-- Loja Tech - Esquema MySQL
CREATE DATABASE IF NOT EXISTS loja_tech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE loja_tech;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS avaliacoes, pedido_itens, pedidos, usuarios, produto_modelos, produto_imagens, produtos, banners, categorias;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(80) NOT NULL,
  imagem_url VARCHAR(255) NOT NULL
);

CREATE TABLE banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imagem_url VARCHAR(255) NOT NULL
);

CREATE TABLE produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  preco DECIMAL(12,2) NOT NULL COMMENT 'Preço em Kwanzas (Kz)',
  avaliacao DECIMAL(2,1) NOT NULL DEFAULT 0 COMMENT 'Avaliação inicial; passa a ser a média dos clientes quando existirem avaliações',
  recomendado TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE produto_imagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL,
  imagem_url VARCHAR(255) NOT NULL,
  ordem INT NOT NULL DEFAULT 0,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE TABLE produto_modelos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL,
  nome VARCHAR(80) NOT NULL,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  papel ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  endereco VARCHAR(255) NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  metodo_pagamento ENUM('multicaixa_express','multicaixa','presencial') NOT NULL DEFAULT 'presencial',
  referencia VARCHAR(20) NULL,
  estado ENUM('pendente','pago','enviado','entregue','cancelado') NOT NULL DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE pedido_itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  modelo VARCHAR(80) NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE TABLE avaliacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  estrelas TINYINT NOT NULL,
  comentario VARCHAR(500) NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uma_por_cliente (produto_id, usuario_id),
  CONSTRAINT chk_estrelas CHECK (estrelas BETWEEN 1 AND 5),
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_produtos_recomendado ON produtos (recomendado);
CREATE INDEX idx_pedidos_estado ON pedidos (estado);

INSERT INTO categorias (id,titulo,imagem_url) VALUES
(1,'Computadores','/imagens/cat1.png'),
(2,'Telemóveis','/imagens/cat2.png'),
(3,'Auscultadores','/imagens/cat3.png'),
(4,'Consolas','/imagens/cat4.png'),
(5,'Câmaras','/imagens/cat5.png'),
(6,'Relógios Inteligentes','/imagens/cat6.png');
INSERT INTO produtos (id,categoria_id,titulo,descricao,preco,avaliacao,recomendado) VALUES (1,3,'Auscultadores 12A','Auscultadores sem fios com som nítido, graves profundos e cancelamento de ruído. Bateria para o dia inteiro e conforto para longas sessões de utilização.',85500,4.6,1);
INSERT INTO produto_imagens (produto_id,imagem_url,ordem) VALUES (1,'/imagens/cat1_1.png',0);
INSERT INTO produto_modelos (produto_id,nome) VALUES (1,'Preto'), (1,'Roxo'), (1,'Rosa'), (1,'Azul');
INSERT INTO produtos (id,categoria_id,titulo,descricao,preco,avaliacao,recomendado) VALUES (2,1,'Portátil Empresarial','Portátil robusto e leve, ideal para trabalho e estudo. Ecrã nítido, teclado confortável e desempenho rápido para as tarefas do dia a dia.',495000,4.7,1);
INSERT INTO produto_imagens (produto_id,imagem_url,ordem) VALUES (2,'/imagens/cat2_1.png',0), (2,'/imagens/cat2_2.png',1), (2,'/imagens/cat2_3.png',2), (2,'/imagens/cat2_4.png',3), (2,'/imagens/cat2_5.png',4);
INSERT INTO produto_modelos (produto_id,nome) VALUES (2,'core i3'), (2,'core i5'), (2,'core i7');
INSERT INTO produtos (id,categoria_id,titulo,descricao,preco,avaliacao,recomendado) VALUES (3,1,'Portátil A34f','Portátil com design moderno e bom desempenho, perfeito para estudantes e profissionais. Arranque rápido e bateria de longa duração.',495000,4.7,0);
INSERT INTO produto_imagens (produto_id,imagem_url,ordem) VALUES (3,'/imagens/loptop3.png',0);
INSERT INTO produto_modelos (produto_id,nome) VALUES (3,'core i3'), (3,'core i5'), (3,'core i7');
INSERT INTO produtos (id,categoria_id,titulo,descricao,preco,avaliacao,recomendado) VALUES (4,1,'Portátil 128 GB','Portátil com 128 GB de armazenamento SSD, rápido e silencioso. Uma óptima opção para quem precisa de mobilidade e velocidade.',495000,4.7,0);
INSERT INTO produto_imagens (produto_id,imagem_url,ordem) VALUES (4,'/imagens/loptop2.png',0);
INSERT INTO produto_modelos (produto_id,nome) VALUES (4,'core i3'), (4,'core i5'), (4,'core i7');
INSERT INTO produtos (id,categoria_id,titulo,descricao,preco,avaliacao,recomendado) VALUES (5,1,'Portátil B2003','Portátil fiável para uso doméstico e de escritório, com ligações modernas e ecrã de boa qualidade.',495000,4.7,0);
INSERT INTO produto_imagens (produto_id,imagem_url,ordem) VALUES (5,'/imagens/loptop4.png',0);
INSERT INTO produto_modelos (produto_id,nome) VALUES (5,'core i3'), (5,'core i5'), (5,'core i7');
INSERT INTO produtos (id,categoria_id,titulo,descricao,preco,avaliacao,recomendado) VALUES (6,1,'Portátil Empresarial Plus','Portátil empresarial com segurança reforçada e excelente autonomia, pensado para equipas que trabalham em qualquer lugar.',495000,4.7,0);
INSERT INTO produto_imagens (produto_id,imagem_url,ordem) VALUES (6,'/imagens/loptop5.png',0);
INSERT INTO produto_modelos (produto_id,nome) VALUES (6,'core i3'), (6,'core i5'), (6,'core i7');
INSERT INTO produtos (id,categoria_id,titulo,descricao,preco,avaliacao,recomendado) VALUES (7,1,'Portátil MOH345','Portátil versátil com óptimo equilíbrio entre preço e desempenho, ótimo para multitarefa e entretenimento.',495000,4.7,0);
INSERT INTO produto_imagens (produto_id,imagem_url,ordem) VALUES (7,'/imagens/loptop6.png',0);
INSERT INTO produto_modelos (produto_id,nome) VALUES (7,'core i3'), (7,'core i5'), (7,'core i7');
INSERT INTO produtos (id,categoria_id,titulo,descricao,preco,avaliacao,recomendado) VALUES (8,5,'Câmara Digital','Câmara digital com várias objectivas à escolha, para fotografias nítidas e vídeo em alta definição em qualquer situação.',675000,4.5,1);
INSERT INTO produto_imagens (produto_id,imagem_url,ordem) VALUES (8,'/imagens/cat3_1.png',0), (8,'/imagens/cat3_2.png',1), (8,'/imagens/cat3_3.png',2), (8,'/imagens/cat3_4.png',3);
INSERT INTO produto_modelos (produto_id,nome) VALUES (8,'18-55mm'), (8,'35-200mm'), (8,'75-300mm');
INSERT INTO produtos (id,categoria_id,titulo,descricao,preco,avaliacao,recomendado) VALUES (9,4,'PS5','Consola de nova geração com gráficos impressionantes, carregamento ultrarrápido e uma enorme biblioteca de jogos.',450000,4.9,1);
INSERT INTO produto_imagens (produto_id,imagem_url,ordem) VALUES (9,'/imagens/cat4_1.png',0), (9,'/imagens/cat4_2.png',1), (9,'/imagens/cat4_3.png',2);
INSERT INTO produto_modelos (produto_id,nome) VALUES (9,'Slim'), (9,'Slim Digital');
