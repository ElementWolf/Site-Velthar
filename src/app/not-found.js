const Error404 = () => {
    return (
        <section className="min-h-screen bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center py-20 px-4">
            <div className="container mx-auto text-center text-white">
                <div className="max-w-2xl mx-auto">
                    {/* Animated 404 number */}
                    <div className="text-[120px] md:text-[200px] font-bold mb-4 animate-bounce">
                        404
                    </div>

                    {/* Error message */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-6">
                        ¡Ups! Página no encontrada
                    </h1>

                    <p className="text-xl mb-8 max-w-xl mx-auto">
                        La página que estás buscando podría haber sido eliminada, haber cambiado de nombre o no está disponible temporalmente.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Error404;