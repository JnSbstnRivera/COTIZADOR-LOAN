# COTIZADOR LOAN

Calculadora de financiamiento solar para **Windmar Home Puerto Rico**. Compara opciones de préstamo entre WH Finance y Oriental Bank en tiempo real y genera propuestas en PDF.

---

## ¿Qué hace?

El asesor ingresa el monto del proyecto y el plazo deseado. La herramienta calcula el pago mensual (fórmula PMT) para dos entidades financieras y genera una propuesta PDF con datos del cliente y consultor lista para presentar.

---

## Características

- Comparación WH Finance vs. Oriental Bank side-by-side
- Cálculo PMT en tiempo real (plazo 5–25 años)
- Campos de cliente y consultor para la propuesta
- Exportación a PDF profesional (jsPDF + html2canvas)
- Persistencia local de cotizaciones (SQLite vía Express)
- Gráficas de amortización (Recharts)
- Dark / Light mode

---

## Stack Técnico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| Backend local | Express.js + better-sqlite3 |
| PDF | jsPDF + html2canvas + pdf-lib |
| Gráficas | Recharts |
| IA | Google Gemini (@google/genai) |
| Fuentes | Outfit, JetBrains Mono |

---

## Variables de entorno

```
GEMINI_API_KEY=
```

---

## Instalación local

```bash
npm install
npm run dev
# http://localhost:5173
```

> El servidor Express corre en el puerto 3001 para guardar cotizaciones localmente. En Vercel la persistencia SQLite no aplica — conectar Supabase si se requiere en producción.

---

## Despliegue

**Producción:** https://cotizador-loan.vercel.app

---

*Desarrollado para Windmar Home Puerto Rico — Call Center Operations*
