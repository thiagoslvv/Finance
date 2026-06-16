# FinanceFlow - Controle de Gastos Pessoais

O **FinanceFlow** é um aplicativo web moderno, fluido e responsivo para controle de gastos pessoais. Ele permite cadastrar, editar, listar e excluir transações financeiras, exibindo o total gasto no mês corrente e gráficos interativos de distribuição de gastos por categoria. 

Os dados são salvos de forma permanente utilizando um banco de dados SQLite local no back-end.

---

## 🚀 Tecnologias Utilizadas

### Front-end
- **HTML5:** Estruturação semântica.
- **CSS3:** Estilização com design moderno (tema escuro), variáveis CSS, flexbox/grid, animações de transição e responsividade total (celular e desktop).
- **JavaScript (ES6+):** Lógica SPA (Single Page Application), chamadas assíncronas à API (Fetch), manipulação do DOM e disparos de alertas dinâmicos.
- **Chart.js (CDN):** Renderização de gráfico de rosca interativo com os gastos mensais.
- **Lucide Icons (CDN):** Biblioteca moderna de ícones vetoriais.

### Back-end & Banco de Dados
- **Python (Flask):** Framework web minimalista e eficiente para criação da API RESTful.
- **SQLite:** Banco de dados relacional leve e sem servidor, ideal para armazenamento permanente local. Os dados são salvos no arquivo `database.db`.

---

## 📊 Estrutura do Banco de Dados

O banco de dados SQLite é inicializado automaticamente ao rodar o projeto pela primeira vez. A tabela principal possui o seguinte esquema:

### Tabela `expenses`
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `INTEGER` | Chave primária com auto-incremento |
| `name` | `TEXT` | Nome ou descrição do gasto (ex: "Supermercado") |
| `value` | `REAL` | Valor monetário em reais (ex: `150.50`) |
| `category` | `TEXT` | Categoria do gasto (Alimentação, Transporte, Moradia, etc.) |
| `date` | `TEXT` | Data da transação no formato ISO (`AAAA-MM-DD`) |

---

## 🛠️ Instalação e Execução (Windows / macOS / Linux)

### Pré-requisitos
Certifique-se de ter o **Python 3.x** instalado em sua máquina. Você pode verificar executando:
```bash
python --version
```

### Passo a Passo

1. **Abra o terminal ou prompt de comando (PowerShell/CMD)** e navegue até a pasta do projeto:
   ```powershell
   cd "C:\Users\User\Desktop\OverWorld\AntiGravity (projetos)"
   ```

2. **(Opcional) Crie e ative um ambiente virtual (Virtualenv):**
   - No Windows:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - No macOS/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Instale as dependências do projeto:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Execute o servidor Flask:**
   ```bash
   python app.py
   ```

5. **Acesse o aplicativo no navegador:**
   Abra seu navegador favorito e acesse o endereço:
   👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 💡 Recursos de Destaque no Design
- **Indicador de Limite Dinâmico:** Progresso de limite de gastos mensais na barra lateral que muda de cor (azul ➔ amarelo ➔ vermelho) à medida que você se aproxima ou ultrapassa o teto definido.
- **Divisão por Categorias:** Orçamentos individuais gerados dinamicamente com base em percentuais recomendados (ex: Moradia 35%, Alimentação 25%, etc.) com barras de progresso próprias.
- **Toast Notifications:** Alertas flutuantes elegantes que informam o sucesso ou erro de qualquer operação (cadastro, edição ou exclusão) instantaneamente sem recarregar a tela.
- **Pesquisa e Filtros:** Barra de buscas por descrição e filtro de categorias com atualização instantânea na tabela de despesas.
