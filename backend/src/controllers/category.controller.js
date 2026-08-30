import * as categoryService from '../services/category.service.js';

export const getMenu = async (_request, response, next) => {
  try {
    const menu = await categoryService.getMenu();

    response.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=3600, stale-while-revalidate=60',
    );
    return response.status(200).json({ data: menu });
  } catch (error) {
    return next(error);
  }
};
