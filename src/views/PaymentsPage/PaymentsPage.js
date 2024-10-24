import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentPageCss from "./../PaymentsPage/PaymentsPage.css";

const App = () => {
    const [data, setData] = useState(null); // Store JSON data
    const [loading, setLoading] = useState(true); // Track loading state
    const [error, setError] = useState(null); // Track errors

    useEffect(() => {
        const listDetails = JSON.parse(localStorage.getItem("paymentPageData"));

        const fetchData = async () => {
            try {
                const response = await fetch("http://127.0.0.1:5000/payment/getAllRecords", {
                    method: "POST", // POST request to send data
                    headers: {
                        "Content-Type": "application/json", // Indicate that the request body is JSON
                    },
                    body: JSON.stringify({ "listingID": listDetails.listingID }), // Convert the JavaScript object/array to JSON string
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const jsonData = await response.json();
                setData(jsonData); // Set the fetched data
                setLoading(false); // Stop the loading state

            } catch (error) {
                setError(error.message); // Handle errors and set error state
                setLoading(false); // Stop loading even if there is an error
            }
        };

        fetchData();
    }, []); // Runs only on mount

    const navigate = useNavigate();
    // Conditional Rendering
    if (loading) return <h2>Loading...</h2>;
    if (error) return <h2>Error: {error}</h2>;
    if (!data || !data.payments || data.payments.length === 0) return (
        <div>
            <h1>{JSON.parse(localStorage.getItem("paymentPageData")).name}</h1>
            <p>{JSON.parse(localStorage.getItem("paymentPageData")).participants.join(', ')}</p>
            <hr />
            <h2>No Payment Records.</h2>
            <div className="buttons-container">
                <button onClick={() => navigate("/settlement-page")} className="settle-btn">Settlement</button>
                <button onClick={() => navigate("/add-payment")} className="add-btn">Add Payment</button>
            </div>
        </div>
    );

    return <ListPage data={data} setData={setData} setError={setError} />; // Pass setError to ListPage
}

const DeletePayment = async (paymentID, navigate, setData, setError) => {
    const listingID = JSON.parse(localStorage.getItem("paymentPageData")).listingID;

    try {
        const response = await fetch("http://127.0.0.1:5000/payment/deleteRecord", {
            method: "POST", // POST request to send data
            headers: {
                "Content-Type": "application/json", // Indicate that the request body is JSON
            },
            body: JSON.stringify({ "listingID": listingID, "paymentID": paymentID }), // Convert the JavaScript object/array to JSON string
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        // Update the state by removing the deleted payment
        setData(prevData => ({
            ...prevData,
            payments: prevData.payments.filter(payment => payment.paymentID !== paymentID)
        }));

        navigate("/payments-page"); // Trigger navigation after the deletion

    } catch (error) {
        console.error(error.message); // Log the error to the console for debugging
        setError(error.message); // Set the error state to display the error message
    }
}

const ListPage = ({ data, setData, setError }) => { // Accept setError here
    const navigate = useNavigate(); // Declare useNavigate in this component

    return (
        <div>
            <h1>{JSON.parse(localStorage.getItem("paymentPageData")).name}</h1>
            <p>{JSON.parse(localStorage.getItem("paymentPageData")).participants.join(', ')}</p>
            <hr />
            <div className="card-container">
                {data.payments.map(payment => (
                    <div key={payment.paymentID} className="card">
                        <h2> {'\u20b9'} {payment.amount}</h2>
                        <p>{payment.description}</p>
                        <hr/>
                        <p><strong>Paid By:</strong> {payment.paidBy}</p>
                        <p><strong>Paid For:</strong> {payment.paidFor.join(', ')}</p>
                        <p><strong>Date of Payment:</strong> {payment.dateOfPayment}</p>
                        <button onClick={() => DeletePayment(payment.paymentID, navigate, setData, setError)} className="delete-btn">
                            Delete
                        </button>
                    </div>
                ))}
            </div>
            <div className="buttons-container">
                <button onClick={() => navigate("/settlement-page")} className="settle-btn">Settlement</button>
                <button onClick={() => navigate("/add-payment")} className="add-btn">Add Payment</button>
            </div>

        </div >
    );
};

export default App;

