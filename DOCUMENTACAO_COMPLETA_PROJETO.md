# 📚 Documentação Completa - Sistema de Locação de Louças e Buffet

## 🎯 Visão Geral do Projeto

**Nome:** Sistema de Locação de Louças e Buffet  
**Objetivo:** Gerenciar locações de louças, talheres e equipamentos para eventos  
**Tipo:** Aplicação Web Full-Stack com Autenticação OAuth  
**Stack Tecnológico:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL

---

## 📊 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                       │
│                         (Frontend)                              │
│  React 19 + Tailwind 4 + TypeScript                             │
│  ├─ Dashboard (Sidebar Navigation)                              │
│  ├─ Produtos (CRUD)                                             │
│  ├─ Kits (CRUD + Composição)                                    │
│  ├─ Clientes (CRUD)                                             │
│  ├─ Pedidos (CRUD + Contratos PDF)                              │
│  └─ Agenda (Calendário de Locações)                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ tRPC (Type-Safe RPC)
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    CAMADA DE APLICAÇÃO                          │
│                      (Backend)                                  │
│  Express 4 + tRPC 11 + TypeScript                               │
│  ├─ Router de Autenticação (OAuth Manus)                        │
│  ├─ Router de Produtos                                          │
│  ├─ Router de Kits                                              │
│  ├─ Router de Clientes                                          │
│  ├─ Router de Pedidos                                           │
│  ├─ Router de Contratos (PDF Generation)                        │
│  └─ Router de Sistema (Notificações)                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ SQL Queries
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    CAMADA DE DADOS                              │
│                      (Database)                                 │
│  MySQL/TiDB (Drizzle ORM)                                       │
│  ├─ Tabela: users                                               │
│  ├─ Tabela: products                                            │
│  ├─ Tabela: kits                                                │
│  ├─ Tabela: kitItems                                            │
│  ├─ Tabela: clients                                             │
│  ├─ Tabela: orders                                              │
│  ├─ Tabela: orderItems                                          │
│  ├─ Tabela: stockMovements                                      │
│  └─ Tabela: contractTemplates                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Modelo de Dados Detalhado

### 1. **Tabela: users**
Gerencia usuários autenticados via OAuth Manus.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,      -- Identificador OAuth
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `openId`: Identificador único do usuário no sistema OAuth Manus
- `role`: Define permissões (admin pode gerenciar tudo, user é cliente)
- `lastSignedIn`: Rastreia último acesso

---

### 2. **Tabela: products**
Louças e equipamentos disponíveis para locação.

```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,              -- Ex: "Prato de Refeição Oitavado"
  category VARCHAR(100) NOT NULL,          -- Ex: "Pratos", "Talheres", "Copos"
  totalQuantity INT NOT NULL,              -- Estoque total disponível
  pricePerUnit INT NOT NULL,               -- Preço em centavos (ex: 120 = R$ 1,20)
  replacementValue INT DEFAULT 0,          -- Valor de reposição para perdas/avarias
  photoUrl TEXT,                           -- URL da imagem do produto
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Exemplo de Dados:**
| id | name | category | totalQuantity | pricePerUnit | replacementValue |
|----|------|----------|---------------|--------------|------------------|
| 1 | Prato de Refeição Oitavado | Pratos | 100 | 120 | 4000 |
| 2 | Garfo de Refeição | Talheres | 200 | 80 | 1000 |
| 3 | Taça Hannover | Copos | 100 | 130 | 1500 |

---

### 3. **Tabela: kits**
Conjuntos pré-configurados de produtos.

```sql
CREATE TABLE kits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,              -- Ex: "Kit Completo para 50 Pessoas"
  description TEXT,
  totalPrice INT NOT NULL DEFAULT 0,       -- Preço total do kit em centavos
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Exemplo:**
- Kit Prato Oitavado/Taça Hannover/Talher = R$ 500,00

---

### 4. **Tabela: kitItems**
Composição de cada kit (quais produtos e quantidades).

```sql
CREATE TABLE kitItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kitId INT NOT NULL,                      -- Referência ao kit
  productId INT NOT NULL,                  -- Referência ao produto
  quantity INT NOT NULL DEFAULT 1,         -- Quantidade do produto no kit
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kitId) REFERENCES kits(id),
  FOREIGN KEY (productId) REFERENCES products(id)
);
```

**Exemplo para Kit Prato Oitavado/Taça/Talher:**
| kitId | productId | quantity |
|-------|-----------|----------|
| 1 | 1 | 50 |
| 1 | 3 | 50 |
| 1 | 2 | 100 |

---

### 5. **Tabela: clients**
Clientes que alugam produtos (pessoas ou empresas).

```sql
CREATE TABLE clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,              -- Ex: "Fabio Luiz Bail"
  documentType ENUM('cpf', 'cnpj') NOT NULL,
  document VARCHAR(20) UNIQUE NOT NULL,    -- CPF ou CNPJ
  phone VARCHAR(20) NOT NULL,              -- Telefone de contato
  email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,                   -- Endereço completo
  city VARCHAR(100),
  state VARCHAR(2),
  zipCode VARCHAR(10),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 6. **Tabela: orders**
Pedidos de locação (aluguel de produtos).

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clientId INT NOT NULL,                   -- Referência ao cliente
  eventAddress TEXT NOT NULL,              -- Onde será o evento
  withdrawalDate DATETIME NOT NULL,        -- Data/hora de retirada
  returnDate DATETIME NOT NULL,            -- Data/hora de devolução
  contractType ENUM('pickup', 'delivery') NOT NULL,
                                           -- pickup = cliente retira
                                           -- delivery = empresa leva e busca
  deliveryFee INT NOT NULL DEFAULT 0,      -- Taxa de entrega em centavos
  totalPrice INT NOT NULL DEFAULT 0,       -- Preço total em centavos
  status ENUM('pending', 'confirmed', 'delivered', 'returned', 'cancelled') 
         DEFAULT 'pending',
  contractUrl TEXT,                        -- URL do contrato em PDF (S3)
  notes TEXT,                              -- Observações
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (clientId) REFERENCES clients(id)
);
```

**Estados do Pedido:**
- `pending`: Criado, aguardando confirmação
- `confirmed`: Confirmado, pronto para retirada
- `delivered`: Entregue ao cliente (se delivery)
- `returned`: Devolvido pelo cliente
- `cancelled`: Cancelado

---

### 7. **Tabela: orderItems**
Itens individuais de um pedido (quais produtos/kits e quantidades).

```sql
CREATE TABLE orderItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,                    -- Referência ao pedido
  productId INT,                           -- Referência ao produto (se item é produto)
  kitId INT,                               -- Referência ao kit (se item é kit)
  quantity INT NOT NULL DEFAULT 1,         -- Quantidade locada
  unitPrice INT NOT NULL DEFAULT 0,        -- Preço unitário no momento da locação
  itemType ENUM('product', 'kit') NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (productId) REFERENCES products(id),
  FOREIGN KEY (kitId) REFERENCES kits(id)
);
```

**Exemplo para Pedido #2:**
| orderId | itemType | productId | quantity | unitPrice |
|---------|----------|-----------|----------|-----------|
| 2 | product | 1 | 50 | 120 |
| 2 | product | 2 | 30 | 120 |
| 2 | product | 3 | 100 | 80 |

---

### 8. **Tabela: stockMovements**
Rastreamento de movimentações de estoque durante locações.

```sql
CREATE TABLE stockMovements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  productId INT NOT NULL,                  -- Qual produto
  orderId INT NOT NULL,                    -- De qual pedido
  movementType ENUM('out', 'in') NOT NULL, -- out = saída, in = retorno
  quantity INT NOT NULL,                   -- Quantidade
  movementDate DATETIME NOT NULL,          -- Quando ocorreu
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id),
  FOREIGN KEY (orderId) REFERENCES orders(id)
);
```

**Fluxo de Movimentação:**
1. Pedido criado → `out` (quantidade sai do estoque)
2. Pedido devolvido → `in` (quantidade retorna ao estoque)

---

### 9. **Tabela: contractTemplates**
Templates de contratos em HTML.

```sql
CREATE TABLE contractTemplates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,              -- Ex: "Contrato Vem Retirar"
  contractType ENUM('pickup', 'delivery') NOT NULL,
  template TEXT NOT NULL,                  -- HTML com placeholders
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🎨 Estrutura do Frontend

### Hierarquia de Componentes

```
App.tsx
├─ Router
│  ├─ Home (Landing Page - não autenticado)
│  └─ Dashboard (Autenticado)
│     ├─ Sidebar (Navegação)
│     └─ MainContent
│        ├─ Products.tsx
│        │  ├─ ProductList
│        │  ├─ ProductForm (Create/Edit)
│        │  └─ ProductCard
│        ├─ Kits.tsx
│        │  ├─ KitList
│        │  ├─ KitForm
│        │  └─ KitComposition
│        ├─ Clients.tsx
│        │  ├─ ClientList
│        │  └─ ClientForm
│        ├─ Orders.tsx
│        │  ├─ OrderList
│        │  ├─ OrderWizard (4 passos)
│        │  ├─ ContractModal
│        │  └─ ContractPreview
│        └─ Calendar.tsx
│           └─ EventCalendar
```

### Páginas Principais

#### **1. Dashboard (Página Principal)**
- **Arquivo:** `client/src/pages/Dashboard.tsx`
- **Função:** Ponto de entrada após autenticação
- **Componentes:**
  - Sidebar com navegação
  - Header com título da página
  - Renderização condicional de páginas
  - Botão de logout

#### **2. Products (Gerenciar Louças)**
- **Arquivo:** `client/src/pages/Products.tsx`
- **Funcionalidades:**
  - Listar todos os produtos
  - Criar novo produto
  - Editar produto existente
  - Deletar produto
  - Exibir estoque total
  - Mostrar preço e valor de reposição

#### **3. Kits (Gerenciar Conjuntos)**
- **Arquivo:** `client/src/pages/Kits.tsx`
- **Funcionalidades:**
  - Listar kits
  - Criar novo kit
  - Adicionar produtos ao kit
  - Remover produtos do kit
  - Calcular preço total do kit

#### **4. Clients (Gerenciar Clientes)**
- **Arquivo:** `client/src/pages/Clients.tsx`
- **Funcionalidades:**
  - Listar clientes
  - Criar novo cliente
  - Editar dados do cliente
  - Deletar cliente
  - Validação de CPF/CNPJ

#### **5. Orders (Gerenciar Pedidos)**
- **Arquivo:** `client/src/pages/Orders.tsx`
- **Funcionalidades:**
  - Listar pedidos com status
  - Criar pedido em 4 passos:
    1. Selecionar cliente
    2. Definir datas (retirada/devolução)
    3. Selecionar produtos/kits
    4. Revisar e confirmar
  - Ver contrato em PDF
  - Baixar contrato
  - Editar pedido
  - Deletar pedido

#### **6. Calendar (Agenda)**
- **Arquivo:** `client/src/pages/Calendar.tsx`
- **Funcionalidades:**
  - Visualizar locações por data
  - Ver quais produtos estão locados
  - Identificar conflitos de disponibilidade
  - Filtrar por cliente ou produto

---

## 🔌 Procedimentos tRPC (Backend API)

### Estrutura de Routers

```typescript
appRouter = {
  system: { ... },           // Sistema (notificações)
  auth: { ... },             // Autenticação
  products: { ... },         // Produtos
  kits: { ... },             // Kits
  clients: { ... },          // Clientes
  orders: { ... },           // Pedidos
}
```

### Router de Produtos

```typescript
products: {
  list()                     // GET todos os produtos
  getById(id)               // GET produto por ID
  create(data)              // POST novo produto
  update(id, data)          // PUT atualizar produto
  delete(id)                // DELETE produto
  getAvailability(id, dates) // GET disponibilidade em período
}
```

### Router de Kits

```typescript
kits: {
  list()                     // GET todos os kits
  getById(id)               // GET kit por ID
  getWithItems(id)          // GET kit com seus produtos
  create(data)              // POST novo kit
  update(id, data)          // PUT atualizar kit
  delete(id)                // DELETE kit
  addProduct(kitId, productId, qty) // Adicionar produto ao kit
  removeProduct(kitId, productId)   // Remover produto do kit
}
```

### Router de Clientes

```typescript
clients: {
  list()                     // GET todos os clientes
  getById(id)               // GET cliente por ID
  create(data)              // POST novo cliente
  update(id, data)          // PUT atualizar cliente
  delete(id)                // DELETE cliente
}
```

### Router de Pedidos

```typescript
orders: {
  list()                     // GET todos os pedidos
  getById(id)               // GET pedido por ID
  getWithItems(id)          // GET pedido com seus itens
  create(data)              // POST novo pedido
  update(id, data)          // PUT atualizar pedido
  delete(id)                // DELETE pedido
  addItem(orderId, item)    // Adicionar item ao pedido
  removeItem(orderId, itemId) // Remover item ao pedido
  generateContract(orderId, type) // Gerar contrato em PDF
  getByDateRange(start, end) // GET pedidos em período
  getByClient(clientId)     // GET pedidos de um cliente
  getAvailableStock(dates)  // GET estoque disponível em período
}
```

### Router de Contratos

```typescript
contracts: {
  generateContract(orderId, contractType)
    // Gera HTML do contrato
    // Converte para PDF
    // Retorna para download
}
```

---

## 📋 Fluxos Principais

### Fluxo 1: Criar um Novo Pedido

```
1. Usuário clica em "Novo Pedido"
   ↓
2. Passo 1: Seleciona Cliente
   - Busca lista de clientes via trpc.clients.list()
   - Seleciona um cliente
   ↓
3. Passo 2: Define Datas
   - Seleciona data de retirada
   - Seleciona data de devolução
   - Escolhe tipo (pickup ou delivery)
   ↓
4. Passo 3: Seleciona Produtos/Kits
   - Busca produtos disponíveis: trpc.products.list()
   - Busca kits disponíveis: trpc.kits.list()
   - Seleciona quantidade de cada item
   - Calcula preço total
   ↓
5. Passo 4: Revisar e Confirmar
   - Exibe resumo do pedido
   - Clica em "Confirmar"
   - Chama: trpc.orders.create(pedidoData)
   ↓
6. Pedido criado com status "pending"
   - Registra movimentação de estoque (out)
   - Exibe mensagem de sucesso
```

### Fluxo 2: Gerar Contrato em PDF

```
1. Usuário clica em "Ver Contrato" de um pedido
   ↓
2. Frontend chama: trpc.orders.generateContract(orderId, type)
   ↓
3. Backend:
   - Recupera pedido com itens: getOrderWithItems(orderId)
   - Recupera dados do cliente: getClientById(clientId)
   - Processa cada item (produtos e kits) para gerar linhas do contrato
   - Carrega o template correto em contractTemplates (pickup/delivery)
   - Substitui placeholders (cliente, itens, datas, valores)
   - Converte o HTML em PDF
   - Salva o PDF em storage (S3) e retorna a URL
   ↓
4. Frontend:
   - Abre modal com preview do contrato
   - Oferece botão de download
```

### Fluxo 3: Controle de Estoque

```
1. Pedido criado
   - Cria registros stockMovements (out)
2. Pedido confirmado/entregue
   - Valida estoque reservado
3. Pedido devolvido
   - Cria registros stockMovements (in)
   - Atualiza disponibilidade
```

---

## 🔐 Autenticação & Autorização

### OAuth Manus
- Login via provedor OAuth Manus.
- Após autenticação, o backend armazena o usuário em `users`.
- Cada sessão possui `openId` como identificador principal.

### Permissões
- **admin:** acesso total ao sistema (CRUD completo).
- **user:** pode visualizar e criar pedidos próprios.

---

## ✅ Regras de Negócio

- Quantidade disponível = `totalQuantity` - (sum(out) - sum(in)) no período.
- Kits devem validar disponibilidade de cada item antes de confirmar locação.
- Pedido só pode ser cancelado se ainda não foi marcado como `delivered`.
- Contrato obrigatório para pedidos `confirmed`.

---

## 🧩 Organização de Pastas (Proposta)

```
root/
├─ client/             # React + Tailwind
│  ├─ src/components
│  ├─ src/pages
│  └─ src/utils
├─ server/             # Express + tRPC
│  ├─ src/routers
│  ├─ src/services
│  ├─ src/db
│  └─ src/utils
└─ shared/             # Tipos e validações compartilhadas
```

---

## 🛠️ Setup do Ambiente

### Pré-requisitos
- Node.js 20+
- MySQL 8+ ou TiDB
- pnpm ou npm

### Variáveis de Ambiente (exemplo)
```
DATABASE_URL=mysql://user:pass@localhost:3306/locacao
OAUTH_CLIENT_ID=...
OAUTH_CLIENT_SECRET=...
OAUTH_REDIRECT_URI=https://app.com/auth/callback
S3_BUCKET_NAME=contratos
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```

### Scripts
```
# client
pnpm dev

# server
pnpm dev
```

---

## 📌 Considerações Finais

Este documento fornece a visão completa para o desenvolvimento do sistema, cobrindo arquitetura, dados, fluxos e regras de negócio. Ele serve como base para implementação e alinhamento com os objetivos do projeto.
