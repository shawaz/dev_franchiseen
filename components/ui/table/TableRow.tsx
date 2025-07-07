import React from 'react';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className = '', ...props }, ref) => (
  <tr ref={ref} className={className} {...props} />
));

TableRow.displayName = 'TableRow';

export default TableRow; 