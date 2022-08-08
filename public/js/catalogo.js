function catalogo() {
    return {

        // catalogs: [],

        // bliblioteca: [],

        async playFilme(id) {
            var idd = id.split('_');
            console.log(idd);
            
            json = JSON.stringify({id: idd[1]});

            var post = await (await fetch('/play', {
                method: 'POST',
                body: json,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }));

            console.log(post);
        }

        // async getFilms() {

        //     this.catalogs = await (await fetch('/catalogs')).json();

        //     var teste = [];

        //     for (const catalog of this.catalogs) {

        //         teste.push({name: catalog.ATTR.name, item: catalog.item, tamanho: 30});

        //         this.bliblioteca = teste;
        //     }

        //     console.log(teste);     
        // },
    }
}