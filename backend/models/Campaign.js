const db = require('../config/database');

const Campaign = {
    // جلب بيانات حملة معينة
    findById: (id, callback) => {
        const query = 'SELECT * FROM campaigns WHERE id = ?';
        db.query(query, [id], callback);
    },

    // تحديث المبلغ الحالي للحملة عند وصول تبرع جديد
    updateAmount: (id, amount, callback) => {
        const query = 'UPDATE campaigns SET current_amount = current_amount + ? WHERE id = ?';
        db.query(query, [amount, id], callback);
    }
};

 Berlaku.exports = Campaign;