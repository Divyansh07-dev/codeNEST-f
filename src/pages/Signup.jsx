import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, checkAuth } from '../authSlice';
import { Link } from 'react-router-dom';

const getErrorMessage = (error) => {
    return error.response?.data?.message || error.message || 'An unknown error occurred.';
};

function Signup() {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        firstName: '',
        emailId: '',
        password: '',
    });
    const [serverMessage, setServerMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerMessage('');
        setIsSuccess(false);

        try {
            const resultAction = await dispatch(registerUser(formData));

            if (registerUser.fulfilled.match(resultAction)) {
                setServerMessage('Registration successful! Logging you in...');
                setIsSuccess(true);
                await dispatch(checkAuth());
            } else {
                const errorMessage = resultAction.payload || getErrorMessage(resultAction.error);
                setServerMessage(`Registration failed: ${errorMessage}`);
                setIsSuccess(false);
            }
        } catch (err) {
            setServerMessage(getErrorMessage(err));
            setIsSuccess(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-black">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
                        Create your account
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* First Name */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-black">
                                    First Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="emailId" className="block text-sm font-medium text-black">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="emailId"
                                        name="emailId"
                                        type="email"
                                        required
                                        value={formData.emailId}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-black">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Status Message */}
                            {serverMessage && (
                                <p className="text-center text-sm text-black">
                                    {serverMessage}
                                </p>
                            )}

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                        loading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                    }`}
                                >
                                    {loading ? 'Loading...' : 'Sign Up'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-black">Or</span>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <Link to="/login" className="font-medium text-black hover:text-gray-700">
                                    Already have an account? Log In
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Signup;
