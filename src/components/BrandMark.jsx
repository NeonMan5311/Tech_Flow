function BrandMark({ subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-xl font-semibold text-white shadow-sm">
        S
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-900">Split It Fair</p>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  )
}

export default BrandMark