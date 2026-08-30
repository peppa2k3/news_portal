import { describe,expect,it } from 'vitest';
import { buildCategoryTree,createSlug } from '../src/services/category.service.js';
describe('category service',()=>{
  it('builds and recursively sorts a nested category tree',()=>{
    const tree=buildCategoryTree([{id:'3',parentId:'1',name:'Z',displayOrder:2},{id:'1',parentId:null,name:'Root',displayOrder:0},{id:'2',parentId:'1',name:'A',displayOrder:1}]);
    expect(tree).toHaveLength(1);expect(tree[0].children.map(item=>item.id)).toEqual(['2','3']);
  });
  it('normalizes Vietnamese names to URL slugs',()=>expect(createSlug('  Điện thoại & Đời sống  ')).toBe('dien-thoai-doi-song'));
});
