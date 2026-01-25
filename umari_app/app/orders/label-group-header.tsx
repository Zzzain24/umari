interface LabelGroupHeaderProps {
  labelName: string
  labelColor: string
  itemCount: number
}

export function LabelGroupHeader({ labelName, labelColor, itemCount }: LabelGroupHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-accent/20 border-b border-border/40">
      {/* Vertical color bar */}
      <div
        className="w-1 h-8 rounded-full"
        style={{ backgroundColor: labelColor }}
      />

      {/* Label name */}
      <div className="flex items-center gap-2 flex-1">
        <h3 className="text-sm font-semibold text-foreground">
          {labelName}
        </h3>

        {/* Item count badge */}
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/40 text-muted-foreground">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>
    </div>
  )
}
