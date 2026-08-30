import client from 'prom-client';
client.collectDefaultMetrics({prefix:'news_portal_'});
const duration=new client.Histogram({name:'news_portal_http_request_duration_seconds',help:'HTTP request duration',labelNames:['method','route','status'],buckets:[0.01,0.05,0.1,0.25,0.5,1,2,5]});
export const metricsMiddleware=(request,response,next)=>{const end=duration.startTimer();response.on('finish',()=>end({method:request.method,route:request.route?.path||request.path,status:String(response.statusCode)}));next();};
export const metrics=async(_request,response)=>{response.set('Content-Type',client.register.contentType);response.send(await client.register.metrics());};
