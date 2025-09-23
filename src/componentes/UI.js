export function Button({ children, onClick, type="button", variant="primary", style }) {
  const base = {
    primary: { background:"#4f46e5", color:"#fff" },
    danger:  { background:"#dc2626", color:"#fff" },
    ghost:   { background:"#fff", color:"#111827", border:"1px solid #e5e7eb" },
  }[variant] || {};
  return (
    <button type={type} onClick={onClick}
      style={{padding:"8px 12px", borderRadius:10, border:"none", cursor:"pointer", ...base, ...style}}>
      {children}
    </button>
  );
}
export function Input({ label, type="text", value, onChange, placeholder, ...rest }) {
  return (
    <label style={{display:"block", marginBottom:10}}>
      {label && <div style={{fontSize:13, marginBottom:6}}>{label}</div>}
      <input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder}
        style={{width:"100%", padding:10, border:"1px solid #e5e7eb", borderRadius:10}} {...rest}/>
    </label>
  );
}
export function Select({ label, value, onChange, options, ...rest }) {
  return (
    <label style={{display:"block", marginBottom:10}}>
      {label && <div style={{fontSize:13, marginBottom:6}}>{label}</div>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%", padding:10, border:"1px solid #e5e7eb", borderRadius:10, background:"#fff"}} {...rest}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
export function Card({ title, actions, children }) {
  return (
    <div style={{background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, boxShadow:"0 6px 18px rgba(0,0,0,.05)", padding:16, marginBottom:16}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
        {title ? <h3 style={{margin:0}}>{title}</h3> : <div/>}
        <div style={{display:"flex", gap:8}}>{actions}</div>
      </div>
      {children}
    </div>
  );
}
export function Table({ columns, data }) {
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{minWidth:700, width:"100%", borderCollapse:"collapse"}}>
        <thead style={{background:"#f9fafb"}}>
          <tr>{columns.map(c=>(
            <th key={c.key} style={{textAlign:"left", padding:10, borderBottom:"1px solid #e5e7eb"}}>{c.name}</th>
          ))}</tr>
        </thead>
        <tbody>
          {data.map((row,i)=>(
            <tr key={i} style={{background:i%2? "#fff":"#fcfcff"}}>
              {columns.map(c=>(
                <td key={c.key} style={{padding:10, borderBottom:"1px solid #f1f5f9"}}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,.25)", display:"grid", placeItems:"center", padding:16, zIndex:50}}>
      <div style={{background:"#fff", borderRadius:16, border:"1px solid #e5e7eb", width:"100%", maxWidth:640, padding:16}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
          <h4 style={{margin:0}}>{title}</h4>
          <button onClick={onClose} style={{border:"none", background:"transparent", fontSize:20, cursor:"pointer"}}>×</button>
        </div>
        <div>{children}</div>
        {footer && <div style={{display:"flex", justifyContent:"end", gap:8, marginTop:12}}>{footer}</div>}
      </div>
    </div>
  );
}