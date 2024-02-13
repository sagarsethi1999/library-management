const issuedBooksContainer = document.getElementById('issuedBooks');
        const returnedBooksContainer = document.getElementById('returnedBooks');

        const fetchIssuedBooks = () => {
            axios.get('http://localhost:3000/issued-books')
                .then(response => {
                    const issuedBooks = response.data;
                    issuedBooksContainer.innerHTML = '';
                    issuedBooks.forEach(book => {
                        const bookCard = document.createElement('div');
                        bookCard.className = 'book-card';
                        bookCard.innerHTML = `
                            <p>Book Name: ${book.name}</p>
                            <p>Book Taken On: ${book.borrowedOn}</p>
                            <p>Book Return On: ${book.returnOn}</p>
                            <p>Current Fine: <span id="fine-${book.name}">${book.fine}</span> Rs.</p>
                            <button class="return-book-btn" data-bookname="${book.name}">Return Book</button>
                        `;
                        issuedBooksContainer.appendChild(bookCard);
                    });
                })
                .catch(error => {
                    console.error('Error fetching issued books:', error);
                });
        };

        const fetchReturnedBooks = () => {
            axios.get('http://localhost:3000/returned-books')
                .then(response => {
                    const returnedBooks = response.data;
                    returnedBooksContainer.innerHTML = '<h2>Returned Books</h2>';
                    returnedBooks.forEach(book => {
                        const bookItem = document.createElement('div');
                        bookItem.innerHTML = `
                            <p>Book Name: ${book.name}</p>
                            <p>Book Taken On: ${book.borrowedOn}</p>
                            <p>Book Returned On: ${book.returnedOn}</p>
                            <p>Fine: ${book.fine} Rs.</p>
                        `;
                        returnedBooksContainer.appendChild(bookItem);
                    });
                })
                .catch(error => {
                    console.error('Error fetching returned books:', error);
                });
        };

        fetchIssuedBooks();
        fetchReturnedBooks();

        document.getElementById('borrowForm').addEventListener('submit', (event) => {
            event.preventDefault();
           

            const bookNameInput = document.getElementById('bookName');
            const bookName = bookNameInput.value;

            axios.post('http://localhost:3000/borrow', { bookName })
                .then(response => {
                    
                    console.log('Book borrowed:', response.data);
                    fetchIssuedBooks();
                    bookNameInput.value='';
            
                })
                .catch(error => {
                    console.error('Error borrowing book:', error);
                    alert('Error borrowing book. Please try again.');
                });
        });


        document.addEventListener('click', async (event) => {
            if (event.target.classList.contains('return-book-btn')) {
                const bookName = event.target.dataset.bookname;
               
                try {
                    const response = await axios.post('http://localhost:3000/return', { bookName });
                    if (response.data.fine === 0) {
                        console.log('Book returned:', response.data);
                        fetchIssuedBooks();
                        fetchReturnedBooks();
                    } else {
                        
                        const fineAmount = response.data.fine;
                        const bookCard = event.target.closest('.book-card');
                        bookCard.innerHTML='';
                        
                        const fineInput = document.createElement('input');
                        fineInput.setAttribute('type', 'text');
                        fineInput.setAttribute('value', `${fineAmount} Rs.`);
                        fineInput.setAttribute('readonly', true);
                        bookCard.appendChild(fineInput);
        
                        
                        const payButton = document.createElement('button');
                        payButton.textContent = 'Pay';
                        payButton.addEventListener('click', async () => {
                            
                            try {
                             
                                console.log('Fine paid successfully.');
                                fetchIssuedBooks();
                                fetchReturnedBooks();
                            } catch (error) {
                                console.error('Error paying fine:', error);
                                alert('Error paying fine. Please try again.');
                            }
                        });
                        bookCard.appendChild(payButton);
                    }
                } catch (error) {
                    console.error('Error returning book:', error);
                    alert('Error returning book. Please try again.');
                }
            }
        });
        



//   setInterval(() => {
//     window.location.reload();
// }, 60* 60 * 1000);
          
setInterval(() => {
    fetchIssuedBooks();
    fetchReturnedBooks();
}, 60 * 60 * 1000);