export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            最終更新日: 2024年1月1日
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. サービスの利用</h2>
            <p className="text-gray-600">
              本サービスを利用することにより、以下の規約に同意したものとみなされます。
              本サービスは、AIを活用したSNSマーケティング支援ツールです。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. アカウント登録</h2>
            <p className="text-gray-600">
              サービスを利用するには、正確な情報でアカウント登録を行う必要があります。
              アカウントのセキュリティを維持する責任はユーザーにあります。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 禁止事項</h2>
            <p className="text-gray-600">以下の行為を禁止します：</p>
            <ul className="list-disc pl-6 text-gray-600 mt-2">
              <li>法律に違反する行為</li>
              <li>他者の権利を侵害する行為</li>
              <li>サービスの運営を妨害する行為</li>
              <li>不正アクセスやハッキング行為</li>
              <li>スパムや大量の自動投稿</li>
              <li>虚偽の情報の拡散</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. コンテンツの所有権</h2>
            <p className="text-gray-600">
              ユーザーが作成したコンテンツの所有権はユーザーに帰属します。
              ただし、サービス提供のために必要な範囲で、当社はコンテンツを使用する権利を有します。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 料金と支払い</h2>
            <p className="text-gray-600">
              基本機能は無料でご利用いただけます。
              追加機能については、別途定める料金プランに従います。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. サービスの変更・終了</h2>
            <p className="text-gray-600">
              当社は、事前の通知により、サービスの内容を変更または終了することができます。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. 免責事項</h2>
            <p className="text-gray-600">
              当社は、サービスの利用により生じた損害について、
              故意または重大な過失がある場合を除き、責任を負いません。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 準拠法</h2>
            <p className="text-gray-600">
              本規約は日本法に準拠し、日本の裁判所を専属的合意管轄とします。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. お問い合わせ</h2>
            <p className="text-gray-600">
              利用規約に関するご質問は、以下までお問い合わせください：
            </p>
            <p className="text-gray-600 mt-2">
              メール: support@example.com
            </p>
          </section>
        </div>

        <div className="mt-12">
          <a href="/" className="text-blue-600 hover:text-blue-500">
            ← ホームに戻る
          </a>
        </div>
      </div>
    </div>
  )
}