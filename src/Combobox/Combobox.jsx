// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { FiChevronDown } from "react-icons/fi";
// import "./Combobox.scss";

// const Combobox = ({
//   options = [],
//   value = null,
//   onChange = () => {},
//   placeholder = "",
//   label = "",
//   getOptionLabel = (o) => String(o?.label ?? o?.value ?? ""),
//   getOptionValue = (o) => String(o?.value ?? o?.id ?? ""),
//   disabled = false,
//   inputAriaLabel = "Поле поиска",
// }) => {
//   const [open, setOpen] = useState(false);
//   const [query, setQuery] = useState("");
//   const [highlight, setHighlight] = useState(-1);
//   const ref = useRef(null);
//   const btnRef = useRef(null);

//   const normalized = useMemo(
//     () =>
//       options
//         .filter(Boolean)
//         .map((o) => ({ raw: o, label: getOptionLabel(o), value: getOptionValue(o) })),
//     [options, getOptionLabel, getOptionValue]
//   );

//   const selected = useMemo(
//     () => normalized.find((o) => String(o.value) === String(value)) || null,
//     [normalized, value]
//   );

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return normalized;
//     return normalized.filter((o) => o.label.toLowerCase().includes(q));
//   }, [normalized, query]);

//   useEffect(() => {
//     const onDown = (e) => {
//       if (!open) return;
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", onDown);
//     return () => document.removeEventListener("mousedown", onDown);
//   }, [open]);

//   const commit = (opt) => {
//     onChange(opt?.value ?? null, opt?.raw ?? null);
//     setQuery("");
//     setOpen(false);
//     setHighlight(-1);
//     if (btnRef.current) btnRef.current.focus();
//   };

//   const onKeyDown = (e) => {
//     if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " " || e.key === "Escape")) {
//       setOpen(true);
//       return;
//     }
//     if (!open) return;
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setHighlight((h) => Math.min(filtered.length - 1, h + 1));
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setHighlight((h) => Math.max(0, h - 1));
//     } else if (e.key === "Enter") {
//       e.preventDefault();
//       if (filtered[highlight]) commit(filtered[highlight]);
//     } else if (e.key === "Escape") {
//       e.preventDefault();
//       setOpen(false);
//       setHighlight(-1);
//     }
//   };

//   return (
//     <div className="combobox" ref={ref}>
//       {label ? <label className="combobox__label">{label}</label> : null}
//       <button
//         ref={btnRef}
//         type="button"
//         className="combobox__control"
//         onClick={() => setOpen((s) => !s)}
//         aria-haspopup="listbox"
//         aria-expanded={open}
//         disabled={disabled}
//       >
//         <span className={`combobox__value ${selected ? "" : "combobox__value--placeholder"}`}>
//           {selected ? selected.label : placeholder}
//         </span>
//         <FiChevronDown className="combobox__icon" />
//       </button>
//       {open && (
//         <div className="combobox__panel" onKeyDown={onKeyDown}>
//           <input
//             className="combobox__input"
//             value={query}
//             onChange={(e) => {
//               setQuery(e.target.value);
//               setHighlight(0);
//             }}
//             placeholder="Поиск…"
//             aria-label={inputAriaLabel}
//             autoFocus
//           />
//           <ul className="combobox__list" role="listbox" tabIndex={-1}>
//             {filtered.length === 0 ? (
//               <li className="combobox__option combobox__option--empty">Ничего не найдено</li>
//             ) : (
//               filtered.map((opt, i) => (
//                 <li
//                   key={opt.value}
//                   role="option"
//                   aria-selected={String(value) === String(opt.value)}
//                   className={`combobox__option ${
//                     i === highlight ? "combobox__option--highlight" : ""
//                   } ${String(value) === String(opt.value) ? "combobox__option--selected" : ""}`}
//                   onMouseEnter={() => setHighlight(i)}
//                   onMouseDown={(e) => {
//                     e.preventDefault();
//                     commit(opt);
//                   }}
//                 >
//                   {opt.label}
//                 </li>
//               ))
//             )}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Combobox;
