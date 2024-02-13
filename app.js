const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(express.json());
app.use(cors());


const sequelize = new Sequelize('library_db', 'root', 'sagarhero143', {
  dialect: 'mysql',
  host: 'localhost'
});



const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    borrowedOn: {
      type: DataTypes.DATE,
      allowNull: false
    },
    returnOn: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fine: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  });


const ReturnedBook = sequelize.define('ReturnedBook', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  borrowedOn: {
    type: DataTypes.DATE,
    allowNull: false
  },
  returnedOn: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fine: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});




app.post('/borrow', async (req, res) => {
  const { bookName } = req.body;

  try {
    const borrowedOn = new Date();
    const returnOn = new Date(borrowedOn.getTime() +  60* 60* 1000); 

    const book = await Book.create({
      name: bookName,
      borrowedOn: borrowedOn,
      returnOn: returnOn,
      fine: 0
    });

    res.json(book);
  } catch (error) {
    console.error('Error borrowing book:', error);
    res.status(500).json({ error: 'Error borrowing book' });
  }
});


app.post('/return', async (req, res) => {
  const { bookName } = req.body;

  try {
    const book = await Book.findOne({ where: { name: bookName } });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const returnedBook = await ReturnedBook.create({
      name: book.name,
      borrowedOn: book.borrowedOn,
      returnedOn: new Date(),
      fine: book.fine
    });

    await book.destroy();

    res.json(returnedBook);
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ error: 'Error returning book' });
  }
});



app.get('/issued-books', async (req, res) => {
  try {
    const issuedBooks = await Book.findAll();
    res.json(issuedBooks);
  } catch (error) {
    console.error('Error fetching issued books:', error);
    res.status(500).json({ error: 'Error fetching issued books' });
  }
});


app.get('/returned-books', async (req, res) => {
  try {
    const returnedBooks = await ReturnedBook.findAll();
    res.json(returnedBooks);
  } catch (error) {
    console.error('Error fetching returned books:', error);
    res.status(500).json({ error: 'Error fetching returned books' });
  }
});








const updateFines = async () => {

  

  try {
    const books = await Book.findAll();
    const now = new Date();

    for (const book of books) {
      if (book.returnOn < now ) {
        
        const timeDiff = now - book.returnOn;
        const hoursLate = Math.floor(timeDiff / (1000 * 60 * 60)); 
        const fine = hoursLate * 10; 
       
        
        await Book.update({ fine }, { where: { id: book.id } });
      }
    }
  } catch (error) {
    console.error('Error updating fines:', error);
  }
};


setInterval(updateFines,60*60* 1000); 


sequelize
.sync()
// .sync({force: true})
.then(() => {
  app.listen(3000);
  console.log('servet is running on PORT 3000');
})
.catch((error) => {
  console.log('servet is not workig',error);
});




