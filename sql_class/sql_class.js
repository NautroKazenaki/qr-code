const sqlite3 = require('sqlite3').verbose();

/**
 * Класс для работы с SQLLite 
*/
class Atis_SQL {
    TablesDB =
        {
            PROVIDERS: "Providers",
            USERS: "Users",
            STAFF: "Staff"
        }

    Levels =
        {
            ADMIN: 0,
            GIGA: 1,
            PALTO: 2,
            CHYSHPAN: 3,
        }

    db;

    /**
     * Конструктор класса которые создает объект db и создает таблицы PROVIDERS USERS STAFF
     * @param {*} DB_File  - Путь к файлу базы данных SQLite.
     */
    constructor(DB_File) {
        try {
            // Файл базы данных уже существует, открыть его
            this.db = new sqlite3.Database(DB_File, (err) => {
                if (err) {
                    console.error('Ошибка создания БД:', err.message);
                }
                else {
                    console.log('БД создана и используется успешно, путь до неё -> ' + DB_File);
                }
            });
        }
        catch (error) {
            console.error('Ошибка создания БД:', error.message);
        }

        if (this.db) {
            // Инициализация базы данных
            this.db.serialize(() => {
                try {
                    // Создание таблицы Производителей
                    this.db.run(`CREATE TABLE IF NOT EXISTS ${this.TablesDB.PROVIDERS} (id INTEGER PRIMARY KEY, name TEXT, error_count INTEGER)`);
                    this.db.run(`CREATE TABLE IF NOT EXISTS ${this.TablesDB.USERS} (id INTEGER PRIMARY KEY, name TEXT, password TEXT, level INTEGER)`);
                    this.db.run(`CREATE TABLE IF NOT EXISTS ${this.TablesDB.STAFF} (id_Iteam INTEGER PRIMARY KEY, name TEXT, time_accept BIGINT, providers TEXT, count_iteams TEXT)`);
                    this.db.run(`CREATE TABLE IF NOT EXISTS AcceptanceDB (
                        id INTEGER PRIMARY KEY,
                        userName TEXT,
                        date TEXT,
                        productName TEXT,
                        quantity INTEGER,
                        provider TEXT,
                        acceptanceNumber INTEGER
                    )`);
                    this.db.run(`CREATE TABLE IF NOT EXISTS Details (
                        id INTEGER PRIMARY KEY,
                        detailName TEXT,
                        quantity INTEGER,
                        provider TEXT,
                        included TEXT
                    )`);
                    this.db.run(`CREATE TABLE IF NOT EXISTS Products (
                        id INTEGER PRIMARY KEY,
                        productName TEXT,
                        includedDetails TEXT,
                        createLimit INTEGER
                    )`);
                    this.db.run(`CREATE TABLE IF NOT EXISTS Orders (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        startDate TEXT NOT NULL,
                        endDate TEXT DEFAULT NULL,
                        isDone INTEGER DEFAULT 0,
                        userName TEXT NOT NULL,
                        includedProducts TEXT NOT NULL,
                        orderTo TEXT
                    )`);
                    this.db.run(`CREATE TABLE IF NOT EXISTS ManufacturingStatus (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        orderId INTEGER NOT NULL,
                        productId INTEGER NOT NULL,
                        manufactured INTEGER DEFAULT 0,
                        FOREIGN KEY (orderId) REFERENCES Orders(id),
                        FOREIGN KEY (productId) REFERENCES Products(id)
                    )`);
                    this.db.run(`CREATE TABLE IF NOT EXISTS ProductsInDevelopment (
                        id INTEGER ,
                        productName TEXT,
                        part INTEGER,
                        manufacturer TEXT,
                        startDateOfManufacturer TEXT PRIMARY KEY,
                        endDateOfManufacturer TEXT DEFAULT NULL,
                        comments TEXT ARRAY,
                        additionalDetails JSON ARRAY,
                        phase INTEGER,
                        partOfOrder INTEGER
                    )`)
                }
                catch (err) {
                    console.error('Ошибка заполнения БД:', err.message);
                }
            });
        }
        else {
            console.error('БД не сериализована');
        }
    }

    /**
     * Функция для добавления поставщика в таблицу PROVIDERS.
     * @param {string} name - Название фирмы поставщиков.
     * @param {number} errorCount - Количество поставок с браком (по умолчанию 0).
     * @returns {number} -  идентификатор последней вставленной строки или ошибку добавления или ошибку Поставщик с таким именем уже существует
    */
    async addProvider(name, errorCount = 0) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT id FROM ${this.TablesDB.PROVIDERS} WHERE name = ?`, [name], (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row) {
                    reject(new Error('Поставщик с таким именем уже существует'));
                }
                else {
                    this.db.run(`INSERT INTO ${this.TablesDB.PROVIDERS} (name, error_count) VALUES (?, ?)`, [name, errorCount], function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(this.lastID);
                        }
                    });
                }
            });
        });
    }

    async addDefaultUserIfNeeded() {
        try {
            const adminName = 'admin';
            const adminPassword = 'Dd7560848';
            const adminLevel = 0;
            let allUsers = await this.getAllUsers()
            let admin = allUsers.find(user => user.name === adminName);

            if (admin) {
                console.log('Admin уже существует.');
                return;
            }
    
            // Add default admin user
            await this.addUser(adminName, adminPassword, adminLevel);
            console.log('пользователь admin успешно добавлен');
        } catch (error) {
            console.error('Ошибка при добавлении admin:', error);
        }
    }

    /**
     * Функция для добавления пользователя в таблицу USERS.
     * @param {string} name - Имя пользователя.
     * @param {string} password - Пароль пользователя.
     * @param {string} level - Уровень пользователя.
     * @returns {number} - идентификатор последней вставленной строки или ошибку добавления или ошибку Пользователь с таким именем уже существует
    */
    async addUser(name, password, level) {

        return new Promise((resolve, reject) => {
            // Проверка наличия пользователя с таким же именем
            this.db.get(`SELECT id FROM ${this.TablesDB.USERS} WHERE name = ?`, [name], (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row) {
                    reject(new Error('Пользователь с таким именем уже существует'));
                }
                else {
                    // Добавление пользователя, если его нет в базе данных
                    this.db.run(`INSERT INTO ${this.TablesDB.USERS} (name, password, level) VALUES (?, ?, ?)`, [name, password, level], function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(this.lastID); // Возвращаем идентификатор последней вставленной строки
                        }
                    });
                }
            });
        });
    }


    /**
* Функция для добавления пользователя в таблицу USERS.
* @param {string} userName - Имя пользователя.
* @param {string} date - Дата добавления товара.
* @param {string} productName - Название товара.
* @param {number} quantity - Количество товара.
* @param {string} provider - Название поставщика.
* @param {number} acceptanceNumber - Номер поставки.
* @returns {number} - идентификатор последней вставленной строки или ошибку добавления или ошибку Пользователь с таким именем уже существует
*/
    async addStuff(userName, date, productName, quantity, provider, acceptanceNumber) {
        return new Promise((resolve, reject) => {
            // Добавление пользователя, если его нет в базе данных
            this.db.run(`INSERT INTO AcceptanceDB (userName, date, productName, quantity, provider, acceptanceNumber) VALUES (?, ?, ?, ?, ?, ?)`, [userName, date, productName, quantity, provider, acceptanceNumber], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.lastID); // Возвращаем идентификатор последней вставленной строки
                }
            });
        });
    }

    //Добыча поставок для отрисовки
    /**
 * Функция для добычи данных из таблицы приемок.
 * @returns {Array<Object>} - массив объектов, представляющий набор информации о товаре в поставке []{}
*/


    async fetchDataFromDB() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT * FROM AcceptanceDB ORDER BY acceptanceNumber DESC, id DESC;
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Функция для получения всех пользователей из таблицы USERS.
     * @returns {<Array<Object>} - Массив объектов, представляющих пользователей []{id,name,password}.
    */
    async getAllUsers() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.TablesDB.USERS}`, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Функция для получения всех деталей из базы данных Details.
     * @returns {<Array<Object>} - Массив объектов, представляющий продукты []{id,detailName,quantity, provider, included}.
    */
    async getDetails() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.TablesDB.USERS}`, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Функция для получения всех деталей из базы данных Products.
     * @returns {<Array<Object>} - Массив объектов, представляющий продукты []{id,ProductName, IncludedDetails, CreateLimit}.
    */
    async getProducts() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.TablesDB.USERS}`, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Функция для получения всех производителей из таблицы PROVIDERS.
     * @returns {<Array<Object>} - Массив объектов, представляющих производителей []{id,name,error_count}.
    */
    async getAllProviders() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.TablesDB.PROVIDERS}`, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Функция для увеличения счетчика ошибок поставок по имени производителя.
     * @param {string} name - Имя производителя.
     * @returns {number} - Количество обновленных строк.
    */
    async increaseErrorCount(name) {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${this.TablesDB.PROVIDERS} SET error_count = error_count + 1 WHERE name = ?`, [name], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.changes);
                }
            });
        });
    }

    /**
     * Функция для удаления пользователя из таблицы USERS.
     * @param {string} name - Имя пользователя.
     * @returns {number} - Количество удаленных строк.
    */
    async deleteUser(name) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM ${this.TablesDB.USERS} WHERE name = ?`, [name], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.changes); // Возвращаем количество удаленных строк
                }
            });
        });
    }

    /**
     * Функция для удаления производителя из таблицы PROVIDERS.
     * @param {string} name - Имя производителя.
     * @returns {number} - Количество удаленных строк.
    */
    async deleteProvider(name) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM ${this.TablesDB.PROVIDERS} WHERE name = ?`, [name], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.changes); // Возвращаем количество удаленных строк
                }
            });
        });
    }

    /**
     * Функция для аутентификации пользователя.
     * @param {string} name - Имя пользователя.
     * @param {string} password - Пароль пользователя.
     * @returns {boolean} - true, если аутентификация успешна, и в false в противном случае.
    */
    async authenticateUser(name, password) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.TablesDB.USERS} WHERE name = ? AND password = ?`, [name, password], (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (!row) {
                    resolve(false); // Пользователь с таким именем и паролем не найден
                }
                else {
                    resolve(true); // Пользователь успешно аутентифицирован
                }
            });
        });
    }

    /**
     * Функция для смены пароля пользователя.
     * @param {string} name - Имя пользователя.
     * @param {string} currentPassword - Текущий пароль пользователя.
     * @param {string} newPassword - Новый пароль пользователя.
     * @returns {boolean} - true, если смена пароля прошла успешно, и в false в противном случае.
    */
    async changePassword(name, currentPassword, newPassword) {
        return new Promise((resolve, reject) => {
            // Проверяем текущий пароль пользователя
            this.db.get(`SELECT id FROM ${this.TablesDB.USERS} WHERE name = ? AND password = ?`, [name, currentPassword], (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (!row) {
                    resolve(false); // Неверный текущий пароль
                }
                else {
                    // Обновляем пароль пользователя
                    this.db.run(`UPDATE ${this.TablesDB.USERS} SET password = ? WHERE name = ?`, [newPassword, name], function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(true); // Пароль успешно изменен
                        }
                    });
                }
            });
        });
    }

    /**
     * Функция для уменьшения количества неудачных поставок (сбоев) по имени производителя.
     * @param {string} name - Имя производителя.
     * @returns {Promise<number>} - Количество обновленных строк.
    */
    async decreaseErrorCount(name) {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${this.TablesDB.PROVIDERS} SET error_count = error_count - 1 WHERE name = ? AND error_count > 0`, [name], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.changes); // Возвращаем количество обновленных строк
                }
            });
        });
    }

    //TESTING
    async getAllDetails() {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM Details`,
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    async getProductsByIncludedDetail(detailName) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM Products WHERE includedDetails LIKE ?`,
                [`%"detailName":"${detailName}"%`],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    /**
     * Add a new detail to the Details table.
     * @param {string} detailName - The name of the detail.
     * @param {number} quantity - The quantity of the detail.
     * @param {string} provider - The provider of the detail.
     * @returns {Promise<number>} - The ID of the last inserted row.
     */
    async addDetail(detailName, quantity, provider) {
        try {
            // Check if the detail already exists in the Details table
            const existingDetail = await this.getAllDetails(detailName, provider);
            
            

            if (existingDetail.some(detail => detail.detailName === detailName && detail.provider === provider)) {
                // Detail already exists, update the quantity
                await this.db.run(
                    `UPDATE Details SET quantity = quantity + ? WHERE detailName = ? AND provider = ?`,
                    [quantity, detailName, provider]
                );
            } else {
                // Detail doesn't exist, insert a new row
                await this.db.run(
                    `INSERT INTO Details (detailName, quantity, provider) VALUES (?, ?, ?)`,
                    [detailName, quantity, provider]
                );
            }
        } catch (error) {
            console.error("Error adding detail:", error);
            throw error; // rethrow the error to handle it elsewhere if needed
        }
    }
    /**
 * Function to add a product to the "Products" table.
 * @param {string} productName - The name of the product.
 * @param {Array} includedDetails - An array of included details for the product.
 * @returns {number} - The ID of the last inserted row, or an error if insertion fails.
 */
    async addProduct(productName, includedDetails) {
        return new Promise((resolve, reject) => {
            // Add your validation logic here if necessary

            // Insert the product into the "Products" table
            this.db.run(`INSERT INTO Products (productName, includedDetails) VALUES (?, ?)`, [productName, JSON.stringify(includedDetails)], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }
    
    async getAllProducts() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM Products`, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    async deleteProductById(productId) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM Products WHERE id = ?`, [productId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true); // Return true if deletion is successful
                }
            });
        });
    }
    /**
 * Function to add an order to the "Orders" table.
 * @param {string} startDate - The start date of the order.
 * @param {string} orderTo - The recipient of the order.
 * @param {Array} selectedProducts - An array of selected products for the order.
 * @returns {number} - The ID of the last inserted row, or an error if insertion fails.
 */
    async addOrder(startDate, orderTo, selectedProducts, userName) {
        return new Promise((resolve, reject) => {
            // Insert the order into the "Orders" table
            this.db.run(`INSERT INTO Orders (startDate, orderTo, includedProducts, userName) VALUES (?, ?, ?, ?)`, [startDate, orderTo, JSON.stringify(selectedProducts), userName], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }
/**
 * Fetch all orders from the Orders table.
 * @returns {Promise<Array>} - An array of orders.
 */
async getAllOrders() {
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT * FROM Orders`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => {
                    return {
                        id: row.id,
                        startDate: row.startDate,
                        orderTo: row.orderTo,
                        includedProducts: JSON.parse(row.includedProducts),
                        userName: row.userName
                    };
                }));
            }
        });
    });
}
/**
 * Delete an order from the Orders table by its ID.
 * @param {number} orderId - The ID of the order to delete.
 * @returns {Promise<boolean>} - True if the deletion is successful, false otherwise.
 */
async deleteOrderById(orderId) {
    return new Promise((resolve, reject) => {
        // Delete the order from the Orders table
        this.db.run(`DELETE FROM Orders WHERE id = ?`, [orderId], function (err) {
            if (err) {
                reject(err);
            } else {
                // Check if any row was affected
                const rowsAffected = this.changes;
                resolve(rowsAffected > 0);
            }
        });
    });
}
async getProductsByOrder(orderId) {
    return new Promise((resolve, reject) => {
        this.db.get(`SELECT includedProducts FROM Orders WHERE id = ?`, [orderId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                // Parse the JSON array of included products
                const includedProducts = JSON.parse(row.includedProducts);
                resolve(includedProducts);
            }
        });
    });
}

// SQL query to fetch details by product ids
async getDetailsByProducts(productNames) {
    const query = `
        SELECT json_each.value AS detail
        FROM Products, json_each(Products.includedDetails) 
        WHERE Products.productName IN (${productNames.map(name => `'${name}'`).join(', ')})
    `;

    return new Promise((resolve, reject) => {
        this.db.all(query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const details = rows.map(row => {
                    const detail = JSON.parse(row.detail);
                    return { detailName: detail.detailName, quantity: detail.quantity };
                });
                resolve(details);
            }
        });
    });
}
// Function to update the manufactured field of a product in the database
async updateProductManufactured (orderId, productName, manufactured)  {
    try {
        // Prepare the update statement
        const stmt = this.db.prepare(`UPDATE Orders 
                                 SET includedProducts = json_patch(includedProducts, '$[${productName}].manufactured', ${manufactured ? 1 : 0})
                                 WHERE id = ?`);

        // Execute the update statement
        stmt.run(orderId);

        console.log(`Product '${productName}' manufacturing status updated successfully.`);
    } catch (error) {
        console.error('Error updating product manufacturing status:', error.message);
        throw error;
    }
};

async getOrderById(orderId)  {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM Orders WHERE id = ?`;
        this.db.get(query, [orderId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                if (row) {
                    // Parse includedProducts field from JSON string to an array of objects
                    const includedProducts = JSON.parse(row.includedProducts);
                    resolve({
                        id: row.id,
                        startDate: row.startDate,
                        endDate: row.endDate,
                        isDone: row.isDone,
                        userName: row.userName,
                        includedProducts: includedProducts,
                        orderTo: row.orderTo
                    });
                } else {
                    resolve(null); // If no order found with the given ID
                }
            }
        });
    });
}
// Function to update the includedProducts field of an order in the Orders table
async updateOrderIncludedProducts(orderId, updatedIncludedProducts) {
    return new Promise((resolve, reject) => {
        const updatedIncludedProductsString = JSON.stringify(updatedIncludedProducts);
        const query = `UPDATE Orders SET includedProducts = ? WHERE id = ?`;
        this.db.run(query, [updatedIncludedProductsString, orderId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

async addManufacturingStatus (orderId, productId, manufactured) {
    try {
        const stmt = this.db.prepare(`INSERT INTO ManufacturingStatus (orderId, productId, manufactured) VALUES (?, ?, ?)`);
        stmt.run(orderId, productId, manufactured ? 1 : 0);
        console.log(`Manufacturing status added successfully.`);
    } catch (error) {
        console.error('Error adding manufacturing status:', error.message);
        throw error;
    }
};

async getManufacturingStatusForOrder(orderId) {
    console.log(orderId)
    return new Promise((resolve, reject) => {
        // Query the ManufacturingStatus table to get manufacturing status for products related to the specified order
        this.db.all('SELECT * FROM ManufacturingStatus WHERE orderId = ?', [orderId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
                console.log(rows)
            }
        });
    });
}
async subtractDetails(orderId, productName, requiredDetails) {
    try {
        await new Promise((resolve, reject) => {
            this.db.run(`BEGIN TRANSACTION`, async (err) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        const util = require('util');
                        let quantityNeededMultiply = 0;
                        const order = await util.promisify(this.db.get).bind(this.db)('SELECT * FROM orders WHERE id = ?', [orderId]);
                        const includedProducts = JSON.parse(order.includedProducts);
                        const includedProduct = includedProducts.find(product => product.productName === productName);
                        if (!includedProduct) {
                            reject(new Error(`Product ${productName} not found in the order`));
                            return;
                        } else {
                            quantityNeededMultiply = includedProduct.quantity;
                        }

                        const allDetails = await util.promisify(this.db.all).bind(this.db)('SELECT * FROM Details');
                        for (const detail of requiredDetails) {
                            const detailName = detail.detailName;
                            const detailQuantity = detail.quantity;
                            const existingDetail = allDetails.find(d => d.detailName === detailName);

                            if (existingDetail) {
                                const newQuantity = existingDetail.quantity - detailQuantity * quantityNeededMultiply;

                                if (newQuantity < 0) {
                                    reject(new Error(`Not enough quantity for detail: ${detailName}`));
                                    return;
                                }

                                await util.promisify(this.db.run).bind(this.db)(`UPDATE Details SET quantity = ? WHERE id = ?`, [newQuantity, existingDetail.id]);
                            } else {
                                await util.promisify(this.db.run).bind(this.db)(`INSERT INTO Details (detailName, quantity) VALUES (?, ?)`, [detailName, -detailQuantity]);
                            }
                        }
                        await util.promisify(this.db.run).bind(this.db)(`COMMIT`);
                        resolve();
                    } catch (error) {
                        await util.promisify(this.db.run).bind(this.db)(`ROLLBACK`);
                        reject(error);
                    }
                }
            });
        });
    } catch (error) {
        throw error;
    }
}

async setManufacturingData(manufacturingData) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO ProductsInDevelopment (id, productName, part, manufacturer, startDateOfManufacturer, endDateOfManufacturer, comments, additionalDetails, phase, partOfOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            manufacturingData.id,
            manufacturingData.productName,
            manufacturingData.part,
            manufacturingData.manufacturer,
            manufacturingData.startDateOfManufacturer,
            manufacturingData.endDateOfManufacturer,
            JSON.stringify(manufacturingData.comments),
            JSON.stringify(manufacturingData.additionalDetails),
            manufacturingData.phase,
            manufacturingData.partOfOrder
        ];

         this.db.run(sql, params, function (err) {
            if (err) {
                console.error('Error inserting manufacturing data:', err.message);
                reject(err);
            } else {
                console.log(`Row inserted: ${this.lastID}`);
                resolve();
            }
        });
    });
}

async getManufacturedData() {
    return new Promise((resolve, reject) => {
        this.db.all('SELECT * FROM ProductsInDevelopment', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async updatePhase(id, newPhase) {
    return new Promise((resolve, reject) => {
        this.db.run(`UPDATE ProductsInDevelopment SET phase = ? WHERE id = ?`, [newPhase, id], function (err) {
            if (err) {
                console.error('Error updating phase:', err.message);
                reject(err);
            } else {
                console.log(`Row updated: ${this.changes}`);
                resolve();
            }
        });
    });
}

async addProvider(name) {

    return new Promise((resolve, reject) => {
        this.db.run(`INSERT INTO Providers (name) VALUES (?)`, [name], function (err) {
            if (err) {
                console.error('Error adding provider:', err.message);
                reject(err);
            } else {
                console.log(`Provider added successfully. ID: ${this.lastID}`);
                resolve(this.lastID);
            }
        });
    });
}

async getAllProviders() {
    return new Promise((resolve, reject) => {
        this.db.all('SELECT * FROM Providers', (err, rows) => {
            if (err) {
                console.error('Error fetching providers:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async deleteProvider(providerName) {
    return new Promise((resolve, reject) => {
        this.db.run(`DELETE FROM Providers WHERE name = ?`, [providerName], function (err) {
            if (err) {
                console.error('Error deleting provider:', err.message);
                reject(err);
            } else {
                console.log(`Provider deleted successfully`);
                resolve();
            }
        });
    });
}

async addCommentToDatabase(productId, comment) {
    return new Promise((resolve, reject) => {
        // First, retrieve the existing comments for the product
        this.db.get('SELECT comments FROM ProductsInDevelopment WHERE id = ?', [productId], (error, row) => {
            if (error) {
                reject(error);
            } else {
                let existingComments = [];
                if (row && row.comments) {
                    // If there are existing comments, parse them from JSON
                    existingComments = JSON.parse(row.comments);
                }
                // Append the new comment to the existing array
                existingComments.push(comment);
                // Convert the updated comments array back to JSON
                const updatedComments = JSON.stringify(existingComments);
                // Update the database with the new comments
                this.db.run('UPDATE ProductsInDevelopment SET comments = ? WHERE id = ?', [updatedComments, productId], (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
}

}


module.exports = Atis_SQL;