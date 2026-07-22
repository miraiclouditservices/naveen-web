import React from 'react';

export interface TableColumn<T> {
  header: React.ReactNode;
  render: (item: T, index: number) => React.ReactNode;
  style?: React.CSSProperties;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  rowStyle?: (item: T, index: number) => React.CSSProperties;
  rowClassName?: (item: T, index: number) => string;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  disableScroll?: boolean;

  // Pagination parameters
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export default function Table<T>({
  columns,
  data,
  isLoading = false,
  loadingMessage = "Fetching transactions ledger...",
  emptyMessage = "No transaction records match this query.",
  rowStyle,
  rowClassName,
  containerClassName = "table-responsive-container table-responsive mt-3",
  containerStyle,
  disableScroll = false,

  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange
}: TableProps<T>) {
  return (
    <div
      className={disableScroll ? "w-100" : "d-flex flex-column flex-grow-1 w-100"}
      style={disableScroll ? {} : { minHeight: 0, overflow: 'hidden' }}
    >
      <div
        className={containerClassName}
        style={disableScroll ? { ...containerStyle } : { minHeight: '320px', maxHeight: '500px', ...containerStyle, flexGrow: 1, overflowY: 'auto' }}
      >
        <table className="table mb-0 align-middle text-nowrap" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr className="border-0">
              {columns.map((col, i) => (
                <th
                  key={typeof col.header === 'string' ? col.header : i}
                  className="py-2 px-4 fw-bold text-start"
                  style={{
                    position: 'sticky',
                    top: '0',
                    color: 'var(--bg-card)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    border: 'none',
                    borderBottom: '1px solid var(--border-color)',
                    textTransform: 'uppercase',
                    ...col.style,
                    backgroundColor: 'var(--dark-section)',
                    zIndex: col.style?.position === 'sticky' ? 10 : 9
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={`shimmer-row-${rowIndex}`}>
                  {columns.map((col, colIdx) => (
                    <td
                      key={`shimmer-cell-${rowIndex}-${colIdx}`}
                      className="py-2 px-4"
                      style={{ border: 'none', borderBottom: '1px solid var(--border-color)', backgroundColor: rowIndex % 2 === 0 ? 'var(--bg-app)' : 'var(--bg-card)' }}
                    >
                      <div
                        className="shimmer-wrapper shimmer-line"
                        style={{
                          width: colIdx === 0 ? '60%' : colIdx === columns.length - 1 ? '40%' : '80%',
                          height: '16px',
                          borderRadius: '4px',
                          opacity: 0.7
                        }}
                      ></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5 text-muted small" style={{ border: 'none' }}>
                  <i className="bi bi-credit-card-2-front fs-2 d-block mb-2 text-muted opacity-50"></i>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => {
                const rowBgColor = idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-app)';
                const customStyle = rowStyle ? rowStyle(item, idx) : {};
                const className = rowClassName ? rowClassName(item, idx) : '';
                return (
                  <tr key={idx} className={className} style={{ fontSize: '0.85rem', ...customStyle }}>
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className="py-2 px-4"
                        style={{
                          border: 'none',
                          borderBottom: '1px solid var(--border-color)',
                          backgroundColor: customStyle.backgroundColor || rowBgColor,
                          ...col.style
                        }}
                      >
                        {col.render(item, idx)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {currentPage !== undefined && totalPages !== undefined && onPageChange !== undefined && (
        <div className="px-4 py-3 border-top d-flex justify-content-between align-items-center flex-shrink-0 rounded-bottom-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <span className="small" style={{ color: 'var(--text-muted)' }}>
            {totalItems !== undefined && itemsPerPage !== undefined ? (
              <>
                Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
              </>
            ) : (
              <>
                Page {currentPage} of {totalPages}
              </>
            )}
          </span>
          <div className="d-flex gap-2 align-items-center">
            <button
              className="btn btn-sm border px-2 shadow-none d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            >
              <i className="hgi-stroke hgi-arrow-left-01" style={{ fontSize: '0.85rem' }} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, idx, arr) => {
                const elements = [];
                if (idx > 0 && page - arr[idx - 1] > 1) {
                  elements.push(
                    <span key={`ellipsis-${page}`} className="px-2" style={{ color: 'var(--text-muted)' }}>...</span>
                  );
                }
                elements.push(
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`btn btn-sm shadow-none fw-bold d-inline-flex align-items-center justify-content-center`}
                    style={{
                      backgroundColor: currentPage === page ? 'var(--dark-section)' : 'transparent',
                      color: currentPage === page ? 'var(--bg-card)' : 'var(--text-primary)',
                      border: 'none',
                      borderRadius: '6px',
                      height: '32px',
                      width: '32px',
                      padding: '0px'
                    }}
                  >
                    {page}
                  </button>
                );
                return elements;
              })}

            <button
              className="btn btn-sm border px-2 shadow-none d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <i className="hgi-stroke hgi-arrow-right-01" style={{ fontSize: '0.85rem' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
