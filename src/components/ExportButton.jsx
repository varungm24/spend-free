import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";
import { format } from "date-fns";

export default function ExportButton({ expenses, month, year }) {
  const downloadReport = () => {
    const doc = new jsPDF();
    const monthName = format(new Date(year, month - 1), "MMMM");

    // Header styling
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, "F");

    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(`SPENDFREE`, 14, 20);

    doc.setFontSize(10);
    doc.text(
      `FINANCIAL STATEMENT | ${monthName.toUpperCase()} ${year}`,
      14,
      30
    );

    // Summary Section
    const totals = expenses.reduce(
      (acc, curr) => {
        if (curr.transactionType === "Debit") acc.debit += curr.amount;
        else acc.credit += curr.amount;
        return acc;
      },
      { credit: 0, debit: 0 }
    );

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.text(`SUMMARY OF ACCOUNT`, 14, 55);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 57, 196, 57);

    doc.text(`Total Expenditures:`, 14, 65);
    doc.text(`INR ${totals.debit.toLocaleString("en-IN")}`, 196, 65, {
      align: "right",
    });

    doc.text(`Total Inflow:`, 14, 72);
    doc.text(`INR ${totals.credit.toLocaleString("en-IN")}`, 196, 72, {
      align: "right",
    });

    doc.setFontSize(14);
    doc.text(`Net Balance:`, 14, 82);
    doc.text(
      `INR ${(totals.credit - totals.debit).toLocaleString("en-IN")}`,
      196,
      82,
      { align: "right" }
    );

    // Ledger Table
    const tableData = expenses.map((e) => [
      format(new Date(e.date), "dd MMM yyyy"),
      e.description || "-",
      e.categoryId.toUpperCase(),
      e.paymentType.toUpperCase(),
      e.transactionType.toUpperCase(),
      `Rs. ${e.amount.toLocaleString("en-IN")}`,
    ]);

    autoTable(doc, {
      startY: 95,
      head: [["DATE", "DESCRIPTION", "CATEGORY", "METHOD", "TYPE", "AMOUNT"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        5: { halign: "right", fontStyle: "bold" },
      },
    });

    doc.save(`SpendFree_Report_${monthName}_${year}.pdf`);
  };

  return (
    <button
      onClick={downloadReport}
      className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-2xl font-black text-sm shadow-xl shadow-foreground/10 hover:opacity-90 active:scale-95 transition-all"
    >
      <Download size={18} />
      Export Ledger
    </button>
  );
}
