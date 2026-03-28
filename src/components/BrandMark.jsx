function BrandMark({ subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-xl font-black text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.45)]">
        S
      </div>
      <div>
        <p className="text-lg font-semibold text-white">Split It Fair</p>
        {subtitle ? <p className="text-xs text-slate-400">{subtitle}</p> : null}
      </div>
    </div>
  )
}

export default BrandMark
