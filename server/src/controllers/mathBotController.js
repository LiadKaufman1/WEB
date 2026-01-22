
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getHebrewOperatorName = (operator) => {
    switch (operator) {
        case '+': return 'חיבור';
        case '-': return 'חיסור';
        case '*': return 'כפל';
        case '/': return 'חילוק';
        case '%': return 'אחוזים';
        default: return 'חשבון';
    }
};

const getHint = async (req, res) => {
    try {
        const { num1, num2, operator } = req.body;

        if (num1 === undefined || num2 === undefined || !operator) {
            return res.status(400).json({ error: "Missing required parameters: num1, num2, operator" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let prompt = "";
        const opName = getHebrewOperatorName(operator);

        if (operator === '%') {
            prompt = `
                אתה "מתי החתול", חבר חכם שעוזר לילדים בחשבון.
                הילד קצת מתקשה עם תרגיל: ${num1}% מתוך ${num2}.
                
                המשימה שלך:
                1. תרגיע את הילד שהכל בסדר וזה קל להבנה! 😺
                2. תסביר לו איך לפתור את זה בצעדים ממש ממש קטנים ופשוטים.
                3. תן דוגמה לחישוב עם מספרים קלים יותר קודם.
                4. אל תיתן את התשובה הסופית, אבל תן לו הרגשה שהוא כבר כמעט שם!
                5. דבר במשפטים קצרים וברורים.
             `;
        } else {
            prompt = `
                אתה "מתי החתול", חבר חכם שעוזר לילדים בחשבון.
                הילד קצת מתקשה בתרגיל: ${num1} ${operator} ${num2}.
                
                המשימה שלך:
                1. תרגיע את הילד שהכל בסדר! 😺
                2. גלה לו "סוד" או טריק קטן שפותר את התרגיל בקלות.
                3. אם זה מספר גדול, תציע לו לפרק אותו לחלקים קטנים (למשל: עשרות ויחידות).
                4. תן לו תחושת הצלחה ("אתה תותח!", "זה קטן עליך!").
                5. אל תגלה את התשובה הסופית, רק תן לו את הדרך הקלה.
             `;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ hint: text });

    } catch (error) {
        console.error("Error generating hint:", error);
        // Log detailed error for debugging
        if (error.response) {
            console.error("Error Details:", JSON.stringify(error.response, null, 2));
        }
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

export default {
    getHint
};
