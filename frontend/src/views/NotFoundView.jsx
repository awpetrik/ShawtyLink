export default function NotFoundView() {
    return (
        <div className="container">
            <h1>404</h1>
            <p className="subtitle">Page not found.</p>
            <button onClick={() => window.location.href = '/'}>Go Home</button>
        </div>
    )
}
