import 'dotenv/config';
import argon2 from 'argon2';
import pool from '../src/config/database.js';

const email=process.env.SUPER_ADMIN_EMAIL;
const password=process.env.SUPER_ADMIN_INITIAL_PASSWORD;
if(!email||!password||password.length<12)throw new Error('SUPER_ADMIN_EMAIL and a 12+ character SUPER_ADMIN_INITIAL_PASSWORD are required');
const passwordHash=await argon2.hash(password,{type:argon2.argon2id,memoryCost:19456,timeCost:2,parallelism:1});
try{
  await pool.query(`INSERT INTO users(email,password_hash,full_name,role,status) VALUES(lower($1),$2,'Super Admin','super_admin','active') ON CONFLICT DO NOTHING`,[email,passwordHash]);
  const categories=[['Thời sự','thoi-su',0],['Công nghệ','cong-nghe',1],['Kinh doanh','kinh-doanh',2],['Thể thao','the-thao',3],['Giải trí','giai-tri',4]];
  for(const [name,slug,order] of categories)await pool.query(`INSERT INTO categories(name,slug,display_order) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`,[name,slug,order]);
  console.log('Seed completed. Change the initial Super Admin password immediately.');
}finally{await pool.end();}
