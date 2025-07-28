import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  route("/login", "routes/login.tsx"),
  route("/cadastro", "routes/register.tsx"),
  layout("components/private-layout.tsx", [
    layout("layout.tsx", [index("routes/home.tsx")]),
    route("/novo-registro", "routes/novo-registro.tsx"),
    route("/conta/:id", "routes/conta.tsx"),
    route("/configuracoes", "routes/configuracoes.tsx"),
  ]),
] satisfies RouteConfig;
