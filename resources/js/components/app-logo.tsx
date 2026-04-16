import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md" onClick={() => window.location.href = "/"}>
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div
                onClick={() => window.location.href = '/'}
                className="ml-1 grid flex-1 text-left text-sm cursor-pointer"
                >
                <span className="mb-0.5 truncate leading-none font-semibold">Admin Panel</span>
                </div>

        </>
    );
}
