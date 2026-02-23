python3 -c "
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from datetime import datetime

# Create workbook
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'Đánh giá ứng viên'

# Define styles
header_font = Font(bold=True, color='FFFFFF')
header_fill = PatternFill(start_color='4472C4', end_color='4472C4', fill_type='solid')
thin_border = Border(
    left=Side(style='thin'),
    right=Side(style='thin'),
    top=Side(style='thin'),
    bottom=Side(style='thin')
)

# Headers
headers = ['STT', 'Họ và Tên', 'Vị trí', 'Kiến thức (25đ)', 'Kỹ năng (25đ)', 
           'Mềm (25đ)', 'Phù hợp (25đ)', 'Tổng (100đ)', 'Kết luận', 'Ghi chú']

# Set column widths
ws.column_dimensions['A'].width = 5
ws.column_dimensions['B'].width = 25
ws.column_dimensions['C'].width = 20
ws.column_dimensions['D'].width = 15
ws.column_dimensions['E'].width = 15
ws.column_dimensions['F'].width = 12
ws.column_dimensions['G'].width = 12
ws.column_dimensions['H'].width = 12
ws.column_dimensions['I'].width = 15
ws.column_dimensions['J'].width = 30

# Write headers
for col, header in enumerate(headers, 1):
    cell = ws.cell(row=1, column=col, value=header)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = thin_border

# Sample data rows
sample_data = [
    [1, '', '', '', '', '', '', '', '', ''],
    [2, '', '', '', '', '', '', '', '', ''],
    [3, '', '', '', '', '', '', '', '', ''],
    [4, '', '', '', '', '', '', '', '', ''],
    [5, '', '', '', '', '', '', '', '', ''],
]

# Write sample data
for row_idx, row_data in enumerate(sample_data, 2):
    for col_idx, value in enumerate(row_data, 1):
        cell = ws.cell(row=row_idx, column=col_idx, value=value)
        cell.border = thin_border
        if col_idx in [1]:
            cell.alignment = Alignment(horizontal='center')
        if col_idx in [4, 5, 6, 7, 8]:
            cell.alignment = Alignment(horizontal='center')

# Add title
ws.insert_rows(1)
ws['A1'] = 'BẢNG ĐÁNH GIÁ ỨNG VIÊN - KỸ SƯ XÂY DỰNG'
ws.merge_cells('A1:J1')
ws['A1'].font = Font(bold=True, size=14, color='FFFFFF')
ws['A1'].fill = PatternFill(start_color='203864', end_color='203864', fill_type='solid')
ws['A1'].alignment = Alignment(horizontal='center', vertical='center')
ws.row_dimensions[1].height = 30

# Add date
ws.insert_rows(2)
ws['A2'] = f'Ngày lập: {datetime.now().strftime(\"%d/%m/%Y\")}'
ws.merge_cells('A2:J2')
ws['A2'].font = Font(italic=True)
ws['A2'].alignment = Alignment(horizontal='right')

# Freeze panes
ws.freeze_panes = 'D4'

# Save
wb.save('bang_danh_gia_ung_vien_format.xlsx')
print('✓ bang_danh_gia_ung_vien_format.xlsx created successfully')
"