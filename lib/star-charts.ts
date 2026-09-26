import data from './star-data.json';
export type ChartId='pleiades'|'centauri';
export type ChartStar=typeof data[number];
export const chartStars=data;
export const chartConfig={pleiades:{ra:56.7,dec:24.25,scale:350,bar:0.5,title:'Collca · M45'},centauri:{ra:201,dec:-60.5,scale:24,bar:5,title:'Llamaq ñawin'}};
const radians=Math.PI/180;
// Gnomonic projection of ICRS J2000 coordinates onto a tangent plane.
// East is left and celestial north is up at zero rotation. No local-horizon model.
export function projectStar(star:Pick<ChartStar,'ra'|'dec'>,chart:ChartId,rotation=0){
 const cfg=chartConfig[chart],ra=(star.ra-cfg.ra)*radians,dec=star.dec*radians,dec0=cfg.dec*radians;
 const denominator=Math.sin(dec0)*Math.sin(dec)+Math.cos(dec0)*Math.cos(dec)*Math.cos(ra);
 if(denominator<=0)throw new Error('Position is outside the tangent-plane hemisphere');
 const east=Math.cos(dec)*Math.sin(ra)/denominator/radians;
 const north=(Math.cos(dec0)*Math.sin(dec)-Math.sin(dec0)*Math.cos(dec)*Math.cos(ra))/denominator/radians;
 const x=-east*cfg.scale,y=-north*cfg.scale,angle=rotation*radians;
 return {x:400+x*Math.cos(angle)-y*Math.sin(angle),y:280+x*Math.sin(angle)+y*Math.cos(angle)};
}
export function separation(a:Pick<ChartStar,'ra'|'dec'>,b:Pick<ChartStar,'ra'|'dec'>){const x=Math.sin(a.dec*radians)*Math.sin(b.dec*radians)+Math.cos(a.dec*radians)*Math.cos(b.dec*radians)*Math.cos((a.ra-b.ra)*radians);return Math.acos(Math.max(-1,Math.min(1,x)))/radians}
export const labelOffsets:Record<string,[number,number,'start'|'end']>={Alcyone:[14,28,'start'],Atlas:[-15,30,'end'],Pleione:[-15,-20,'end'],Electra:[14,26,'start'],Maia:[-16,25,'end'],Merope:[14,28,'start'],Taygeta:[16,-16,'start'],Celaeno:[16,-15,'start'],'Asterope (21 Tau)':[-16,-38,'end'],'22 Tau':[18,-14,'start'],'Alpha Centauri':[-14,28,'end'],'Beta Centauri':[14,-19,'start'],Acrux:[14,27,'start'],Mimosa:[-15,-17,'end'],Gacrux:[14,-18,'start'],'Delta Crucis':[14,-16,'start'],'Epsilon Crucis':[15,22,'start']};
