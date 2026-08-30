import * as categoryService from '../../services/category.service.js';

export const createCategory = async (request, response, next) => {
  try {
    const category = await categoryService.createCategory(request.body);

    response.location(`/api/admin/categories/${category.id}`);
    return response.status(201).json({ data: category });
  } catch (error) {
    return next(error);
  }
};

export const updateCategory = async (request, response, next) => {
  try {
    const category = await categoryService.updateCategory(
      request.params.id,
      request.body,
    );

    return response.status(200).json({ data: category });
  } catch (error) {
    return next(error);
  }
};

export const deleteCategory = async (request, response, next) => {
  try {
    await categoryService.deleteCategory(request.params.id);
    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
};
