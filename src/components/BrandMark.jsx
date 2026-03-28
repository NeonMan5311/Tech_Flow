function BrandMark({ subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-semibold text-slate-900">
        S
      </div>
      <div>
        <p className="text-lg font-semibold">Split It Fair</p>
        {subtitle ? <p className="text-xs text-slate-400">{subtitle}</p> : null}
      </div>
    </div>
  )
}

export default BrandMark