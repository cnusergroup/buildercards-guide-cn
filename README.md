# AWS BuilderCards 第二版 · 中文玩法介绍

一个介绍 AWS BuilderCards 2nd Edition 卡牌游戏玩法的中文静态页面。

## 在线访问

[https://buildercards.awscommunity.cn](https://buildercards.awscommunity.cn)

## 项目结构

```
├── index.html          # 单文件静态页面（零依赖）
├── infra/              # AWS CDK 基础设施代码
│   ├── bin/app.ts      # CDK 入口
│   ├── lib/stack.ts    # S3 + CloudFront + ACM 部署栈
│   ├── cdk.json
│   ├── package.json
│   └── tsconfig.json
├── .cdkignore
└── .gitignore
```

## 快速预览（无需部署）

直接用浏览器打开 `index.html` 即可预览，无需任何构建工具或服务器。

## 部署到 AWS

项目使用 AWS CDK 部署到 S3 + CloudFront，成本极低（静态托管 + CDN）。

### 前置条件

- [Node.js](https://nodejs.org/) >= 18
- [AWS CLI](https://aws.amazon.com/cli/) 已配置凭证
- [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) v2

### 步骤

1. 安装依赖：

```bash
cd infra
npm install
```

2. 修改域名配置（`infra/bin/app.ts`）：

```typescript
new BuilderCardsStack(app, 'BuilderCardsSite', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',  // CloudFront + ACM 需要 us-east-1
  },
  domainName: 'your-domain.example.com',  // 替换为你的域名
});
```

3. Bootstrap CDK（首次使用 CDK 时需要）：

```bash
npx cdk bootstrap
```

4. 部署：

```bash
npx cdk deploy
```

5. 部署完成后，根据输出的 `DistributionDomainName`，在你的 DNS 服务商添加 CNAME 记录指向 CloudFront 分配域名。

6. ACM 证书验证：部署过程中 CDK 会创建 ACM 证书，需要在 DNS 中添加验证 CNAME 记录（控制台会显示具体记录值）。

### 不使用自定义域名

如果不需要自定义域名，可以简化 `infra/lib/stack.ts`，移除 `certificate` 和 `domainNames` 配置，直接使用 CloudFront 默认域名访问。

### 其他部署方式

页面是纯静态单文件，也可以直接部署到：

- **GitHub Pages** — 将 `index.html` 推送到 `gh-pages` 分支
- **Netlify / Vercel** — 拖拽上传或连接 Git 仓库
- **S3 静态网站托管** — 手动上传 `index.html` 并开启静态网站托管

## 内容来源

页面内容翻译自 [AWS BuilderCards 2nd Edition の遊び方](https://aws.amazon.com/jp/builders-flash/202509/builder-cards-2nd-edition/)，图片引用自 AWS 官方 CDN。

## License

本项目代码采用 MIT 许可证。页面中引用的 AWS BuilderCards 相关图片和内容版权归 Amazon Web Services 所有。
