import re, json
from docx import Document
from pathlib import Path

# --------- 使用者可調整的參數 ---------
DOCX_PATH = Path(r"C:\Users\user1\Downloads\1132B11021052.docx")  # 課表 docx 檔案
# 保留的節次（依字母順序）。如果你的學校有不同的節次代號，請自行修改。
KEEP_PERIODS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'Z']
# ------------------------------------

def load_docx(path):
    """載入 docx 並回傳表格物件"""
    doc = Document(path)
    return doc.tables[0]  # 課表通常只有 1 個 table

def extract_period_rows(table):
    """
    從表格抓出「節次 → row 物件」的對照 dict，
    row.cells[0] 內容類似 'B. 09:10 | 10:00'
    """
    mapping = {}
    for row in table.rows:
        first_cell = row.cells[0].text.strip()
        if re.match(r'^[A-Z]\.', first_cell):  # 例如 'B.'
            period = first_cell.split('.')[0]  # 取 'B'
            mapping[period] = row
    return mapping

def parse_cell(cell_text):
    """
    從單格文字抓出教室代碼：
      - 先找括號裡面 (EN401-B) → EN401-B
      - 去掉連字號後面的分班代碼 → EN401
      - 如果完全沒有括號，回傳 '0'
    """
    cell_text = cell_text.strip()
    if not cell_text:
        return "0"
    m = re.search(r'\(([A-Za-z0-9\-]+)\)', cell_text)
    if m:
        code = m.group(1)
        return code.split("-")[0]  # 切掉 -B 之類
    return "0"

def build_schedule(table):
    """
    依 KEEP_PERIODS 順序走，抽出星期一~星期五 (col 1~5) 的教室代碼，
    回傳巢狀 list
    """
    period_rows = extract_period_rows(table)
    schedule = []
    for p in KEEP_PERIODS:
        row = period_rows.get(p)
        row_codes = []
        if row:
            cells = row.cells[1:6]  # 星期一到星期五
            row_codes = [parse_cell(c.text) for c in cells]
        else:
            row_codes = ["0"] * 5
        schedule.append(row_codes)
    return schedule

# ---- 主程式 ----
table = load_docx(DOCX_PATH)
schedule_json = build_schedule(table)

print(json.dumps(schedule_json, ensure_ascii=False, indent=2))
