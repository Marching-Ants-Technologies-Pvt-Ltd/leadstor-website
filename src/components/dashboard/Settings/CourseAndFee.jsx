'use client';

import { useState } from 'react';

export default function CourseAndFee() {
    const [courses, setCourses] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [formData, setFormData] = useState({ id: null, course: '', standardFee: '', maximumDiscount: '' });
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Add or Update Course
    const handleSubmit = () => {
        if (formData.course.length > 200) {
            alert("Course name should be within 200 characters.");
            return;
        }
        if (formData.maximumDiscount !== "" && (formData.maximumDiscount < 1 || formData.maximumDiscount > 100)) {
            alert("Maximum discount must be between 1 and 100.");
            return;
        }

        if (formData.id !== null) {
            // Update existing
            setCourses(prev => prev.map(item => item.id === formData.id ? formData : item));
        } else {
            // Add new
            setCourses(prev => [...prev, { ...formData, id: Date.now() }]);
        }

        setIsFormOpen(false);
        setFormData({ id: null, course: '', standardFee: '', maximumDiscount: '' });
    };

    const handleEdit = (course) => {
        setFormData(course);
        setIsFormOpen(true);
    };

    const handleDelete = () => {
        if (selectedIds.length === 0) return alert("Select at least one entry");
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} entries?`)) return;
        setCourses(prev => prev.filter(course => !selectedIds.includes(course.id)));
        setSelectedIds([]);
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const calculateMaxDiscountAmount = (standardFee, maximumDiscount) => {
        if (standardFee && maximumDiscount) {
            return (standardFee * maximumDiscount) / 100;
        }
        return 0;
    };

    return (
        <div className="p-6 bg-white shadow rounded space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Course & Fee Table</h2>
                <div className="space-x-2">
                    <button onClick={() => { setFormData({ id: null, course: '', standardFee: '', maximumDiscount: '' }); setIsFormOpen(true); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add</button>
                    <button onClick={handleDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
                </div>
            </div>

            <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border border-gray-300 px-3 py-2 text-center"><input type="checkbox"
                            onChange={e => setSelectedIds(e.target.checked ? courses.map(c => c.id) : [])}
                            checked={selectedIds.length === courses.length && courses.length > 0}
                        /></th>
                        <th className="border border-gray-300 px-3 py-2">Course</th>
                        <th className="border border-gray-300 px-3 py-2">Standard Fee</th>
                        <th className="border border-gray-300 px-3 py-2">Max Discount (%)</th>
                        <th className="border border-gray-300 px-3 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-4 text-gray-500">No courses available</td></tr>
                    ) : courses.map(course => (
                        <tr key={course.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-3 py-2 text-center">
                                <input type="checkbox" checked={selectedIds.includes(course.id)} onChange={() => toggleSelect(course.id)} />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">{course.course}</td>
                            <td className="border border-gray-300 px-3 py-2">{course.standardFee}</td>
                            <td className="border border-gray-300 px-3 py-2">{course.maximumDiscount}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center">
                                <button onClick={() => handleEdit(course)} className="text-blue-600 hover:underline">Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h3 className="text-lg font-bold mb-4">{formData.id !== null ? 'Edit Course' : 'Add Course'}</h3>
                        <div className="mb-3">
                            <input type="text" name="course" value={formData.course}
                                onChange={e => setFormData({ ...formData, course: e.target.value })}
                                placeholder="Course Name"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div className="mb-3">
                            <input type="number" name="standardFee" value={formData.standardFee}
                                onChange={e => setFormData({ ...formData, standardFee: e.target.value })}
                                placeholder="Standard Fee"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div className="mb-3">
                            <input type="number" name="maximumDiscount" value={formData.maximumDiscount}
                                onChange={e => setFormData({ ...formData, maximumDiscount: e.target.value })}
                                placeholder="Maximum Discount (%)"
                                min="1"
                                max="100"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        {formData.standardFee && formData.maximumDiscount && (
                            <div className="text-sm text-gray-500 mb-3">
                                Max Discount Amount: {calculateMaxDiscountAmount(formData.standardFee, formData.maximumDiscount)}
                            </div>
                        )}
                        <div className="flex justify-end space-x-2">
                            <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{formData.id !== null ? 'Update' : 'Add'}</button>
                            <button onClick={() => setIsFormOpen(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
