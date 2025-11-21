import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateLicensePDF = (user, licenseKey) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      
      // file save location(public/licenses)
      // confirm that this file is there in your code 'public/licenses'
      const fileName = `License-${user._id}-${Date.now()}.pdf`;
      const folderPath = path.join(process.cwd(), "public", "licenses");
      
      // if no folder will create it
      if (!fs.existsSync(folderPath)){
          fs.mkdirSync(folderPath, { recursive: true });
      }

      const filePath = path.join(folderPath, fileName);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // --- PDF design ---
      
      // border
      doc.rect(20, 20, 555, 800).stroke();

      // header
      doc.fontSize(26).font("Helvetica-Bold").text("OFFICIAL LICENSE", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).font("Helvetica").text("This document certifies that", { align: "center" });
      doc.moveDown();

      // User name
      doc.fontSize(20).font("Helvetica-Bold").fillColor("red").text(user.name, { align: "center" });
      doc.fillColor("black"); // color reset
      
      doc.moveDown();
      doc.fontSize(12).font("Helvetica").text("has been granted a PRO Lifetime License.", { align: "center" });
      
      doc.moveDown(2);
      
      // lisence details
      doc.fontSize(14).text(`License Key: ${licenseKey}`, { align: "center" });
      doc.text(`Email: ${user.email}`, { align: "center" });
      doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, { align: "center" });

      doc.moveDown(4);
      
      // footer
      doc.fontSize(10).text("Authorized by Book Hub Team", { align: "center" });

      doc.end();

      writeStream.on("finish", () => {
        // আমরা ফাইলের রিলেটিভ পাথ রিটার্ন করব যা ফ্রন্টএন্ড এক্সেস করতে পারবে
        // নোট: index.js এ 'public' ফোল্ডারটি স্ট্যাটিক করতে হবে
        resolve(`/licenses/${fileName}`);
      });

      writeStream.on("error", (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};