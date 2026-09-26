'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {Locale,CopyKey,translate,locales} from '@/lib/i18n';
type LanguageContext={locale:Locale;setLocale:(locale:Locale)=>void;t:(key:CopyKey)=>string;href:(path:string)=>string};
const Context=createContext<LanguageContext>({locale:'es',setLocale:()=>{},t:key=>translate(key,'es'),href:p=>p});
export function LanguageProvider({children}:{children:React.ReactNode}){
 const [locale,update]=useState<Locale>('es');
 useEffect(()=>{const query=new URLSearchParams(location.search).get('lang');let saved:string|null=null;try{saved=localStorage.getItem('mayu-language')}catch{}const value=query||saved;if(locales.includes(value as Locale))update(value as Locale)},[]);
 useEffect(()=>{document.documentElement.lang=locale==='qu'?'qu-PE':locale;document.title=`Mayu — ${translate('skyTitle',locale)}`},[locale]);
 function setLocale(value:Locale){update(value);try{localStorage.setItem('mayu-language',value)}catch{}const url=new URL(location.href);url.searchParams.set('lang',value);history.replaceState(null,'',url);}
 function href(path:string){const [base,hash]=path.split('#');return `${base}${base.includes('?')?'&':'?'}lang=${locale}${hash?'#'+hash:''}`;}
 return <Context.Provider value={{locale,setLocale,t:key=>translate(key,locale),href}}>{children}</Context.Provider>
}
export function useLanguage(){return useContext(Context)}
