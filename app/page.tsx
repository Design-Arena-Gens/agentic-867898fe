'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function Home() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSourceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceFile(file);
      readExcelFile(file, setSourceData);
    }
  };

  const handleTargetFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTargetFile(file);
    }
  };

  const readExcelFile = (file: File, setData: (data: any[]) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const transferData = async () => {
    if (!sourceFile || !targetFile) {
      setMessage('لطفا هر دو فایل را انتخاب کنید');
      return;
    }

    setProcessing(true);
    setMessage('در حال پردازش...');

    try {
      // خواندن فایل مقصد
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // اضافه کردن داده‌های منبع به فایل مقصد
        const newSheet = XLSX.utils.json_to_sheet(sourceData);
        workbook.Sheets[workbook.SheetNames[0]] = newSheet;

        // ایجاد فایل جدید و دانلود
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
        const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output_' + targetFile.name;
        a.click();

        setMessage('انتقال داده با موفقیت انجام شد! فایل دانلود شد.');
        setProcessing(false);
      };
      reader.readAsBinaryString(targetFile);
    } catch (error) {
      setMessage('خطا در پردازش فایل‌ها');
      setProcessing(false);
    }
  };

  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🤖 ایجنت انتقال داده اکسل</h1>
        <p style={styles.subtitle}>داده‌ها را از یک فایل اکسل به فایل دیگر منتقل کنید</p>

        <div style={styles.section}>
          <label style={styles.label}>
            📁 فایل منبع (خواندن داده):
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleSourceFile}
            style={styles.input}
          />
          {sourceData.length > 0 && (
            <p style={styles.info}>✓ {sourceData.length} ردیف داده خوانده شد</p>
          )}
        </div>

        <div style={styles.section}>
          <label style={styles.label}>
            📁 فایل مقصد (نوشتن داده):
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleTargetFile}
            style={styles.input}
          />
          {targetFile && (
            <p style={styles.info}>✓ فایل مقصد انتخاب شد</p>
          )}
        </div>

        <button
          onClick={transferData}
          disabled={!sourceFile || !targetFile || processing}
          style={{
            ...styles.button,
            ...((!sourceFile || !targetFile || processing) && styles.buttonDisabled)
          }}
        >
          {processing ? '⏳ در حال پردازش...' : '▶️ شروع انتقال داده'}
        </button>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        {sourceData.length > 0 && (
          <div style={styles.preview}>
            <h3 style={styles.previewTitle}>پیش‌نمایش داده‌های منبع:</h3>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {Object.keys(sourceData[0]).map((key) => (
                      <th key={key} style={styles.th}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sourceData.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val: any, i) => (
                        <td key={i} style={styles.td}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sourceData.length > 5 && (
              <p style={styles.moreInfo}>... و {sourceData.length - 5} ردیف دیگر</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    fontFamily: 'Tahoma, Arial, sans-serif',
  },
  card: {
    maxWidth: '900px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '32px',
    color: '#2d3748',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    textAlign: 'center',
    marginBottom: '40px',
  },
  section: {
    marginBottom: '30px',
  },
  label: {
    display: 'block',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: '10px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  info: {
    marginTop: '8px',
    color: '#48bb78',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'transform 0.2s',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  message: {
    marginTop: '20px',
    padding: '15px',
    background: '#e6fffa',
    border: '2px solid #81e6d9',
    borderRadius: '10px',
    color: '#234e52',
    textAlign: 'center',
    fontSize: '16px',
  },
  preview: {
    marginTop: '40px',
    padding: '20px',
    background: '#f7fafc',
    borderRadius: '10px',
  },
  previewTitle: {
    fontSize: '20px',
    color: '#2d3748',
    marginBottom: '15px',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    background: '#667eea',
    color: 'white',
    padding: '12px',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #e2e8f0',
    textAlign: 'right',
  },
  moreInfo: {
    marginTop: '10px',
    color: '#718096',
    fontStyle: 'italic',
    textAlign: 'center',
  },
};
