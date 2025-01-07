process.env.FONTCONFIG_PATH = '/dev/null'

import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage, registerFont } from 'canvas';
import fetch from 'node-fetch';
import fs from 'fs';
import os from 'os';

async function loadFontFromURL(url, familyName) {
  const tempDir = os.tmpdir(); 
  const fontPath = path.join(tempDir, `ARIAL.TTF`);

  // const response = await fetch(url);
  // if (!response.ok) {
  //   throw new Error(`Failed to fetch font: ${response.statusText}`);
  // }
  // const fontBuffer = await response.arrayBuffer();
  // fs.writeFileSync(fontPath, Buffer.from(fontBuffer));
  registerFont(fontPath, { family: familyName });
  
}

const __dirname = dirname(fileURLToPath(import.meta.url));
export const generateCouponImage = async (
  noOfTokens,
  student,
  teacher,
  subject,
  date,
  schoolLogoURL,
  schoolName,
  teacherEmail,
  parentEmail,
) => {
  try {
    await loadFontFromURL(path.join(__dirname, '../fonts/ARIAL.TTF'),'Arial')
    const backgroundImage = await loadImage(path.join(__dirname, './school_token.png'));
    // const backgroundImage = await loadImage(
    //   'https://res.cloudinary.com/dvsl1aslo/image/upload/v1735839196/school_token_qvqoxg.png'
    // );
    const schoolLogo = await loadImage(schoolLogoURL);

    const canvas = createCanvas(690, 400)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(schoolLogo, 80, 80, 80, 80);

  
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    console.log(ctx.font);
    
    ctx.fillText(schoolName, canvas.width / 2, 40);
    ctx.fillText(`Student: ${student}`, canvas.width / 2, 150);
    ctx.fillText(`No. of Tokens: ${noOfTokens}`, canvas.width / 2, 180);
    ctx.fillText(`Teacher: ${teacher} (${subject})`, canvas.width / 2, 200);
    ctx.fillText(`Teacher Email: ${teacherEmail}`, canvas.width / 2, 230);
    ctx.fillText(`Parent Email: ${parentEmail}`, canvas.width / 2, 250);
    ctx.fillText(`Date: ${date}`, canvas.width / 2, 300);

    return canvas.toBuffer();
  } catch (error) {
    console.error('Error generating coupon image:', error);
    throw error;
  }
};


async function testLoadImage() {
    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
      const imgPath = path.join(__dirname, './school_token.png');
      console.log('Loading image from path:', imgPath);
      const image = await loadImage(imgPath);
      console.log('Image loaded successfully:', image);
      return image
    } catch (error) {
      console.error('Error loading image:', error);
    }
  }

