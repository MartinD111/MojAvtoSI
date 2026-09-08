import ReactDOM from 'react-dom/client';

const activeRoots = new Map();

/**
 * Mounts a React component into a DOM element and tracks its root.
 * Unmounts any previously tracked root for the same container.
 * 
 * @param {string} containerId - The ID of the DOM element to mount into.
 * @param {React.ReactElement} reactElement - The React element to mount.
 * @returns {import('react-dom/client').Root | null}
 */
export function mountReactComponent(containerId, reactElement) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`[ReactRootTracker] Container #${containerId} not found.`);
        return null;
    }

    // Unmount existing if reusing same container
    if (activeRoots.has(containerId)) {
        try {
            activeRoots.get(containerId).unmount();
        } catch (e) {
            console.warn(`[ReactRootTracker] Error unmounting existing root for #${containerId}:`, e);
        }
    }

    const root = ReactDOM.createRoot(container);
    root.render(reactElement);
    activeRoots.set(containerId, root);
    return root;
}

/**
 * Unmounts all currently active tracked React roots.
 * Safe to call before replacing the DOM container contents.
 */
export function unmountAllReactRoots() {
    activeRoots.forEach((root, id) => {
        try {
            root.unmount();
        } catch (err) {
            console.warn(`[ReactRootTracker] Error unmounting root ${id}:`, err);
        }
    });
    activeRoots.clear();
}
