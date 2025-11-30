export const api = {
	createCategory: (data) => fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/categories`, { method: "POST", body: data }),
	updateCategory: (id, data) => fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/categories/${id}`, { method: "PUT", body: data }),
	deleteCategory: (id) => fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/categories/${id}`, { method: "DELETE" }),
	
	createCourse: (data) => fetch("${process.env.NEXT_PUBLIC_API_LINK}/api/v1/courses", { method: "POST", body: data }),
	updateCourse: (id, data) => fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/courses/${id}`, { method: "PUT", body: data }),
	deleteCourse: (id) => fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/courses/${id}`, { method: "DELETE" }),
	
	createOption: (courseId, data) => fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/courses/${courseId}/options`, { method: "POST", body: data }),
	updateOption: (courseId, optionIndex, data) =>
		fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/courses/${courseId}/options/${optionIndex}`, { method: "PUT", body: data }),
	deleteOption: (courseId, optionIndex) =>
		fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/courses/${courseId}/options/${optionIndex}`, { method: "DELETE" }),
}
